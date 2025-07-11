'use strict';

const assert = require('assert');

const path = require('path');
const fs = require('fs');

const DSL = require('@darabonba/parser');
const {
  _name, _string, _type, _subModelName, _vid,
  _isBinaryOp, _escape, _snakeCase, _camelCase, _avoidModel,
  REQUEST, RESPONSE, CORE, _upperFirst, _removeFilesInDirectory
} = require('./helper');
const getBuiltin = require('./builtin');
const { Tag } = require('@darabonba/parser/lib/tag');
const Annotation = require('@darabonba/annotation-parser');

function avoidReserveName(name) {
  const reserves = [
    'function'
  ];

  if (reserves.indexOf(name) !== -1) {
    return `_${name}`;
  }

  return name;
}

function getAttr(node, attrName) {
  for (let i = 0; i < node.attrs.length; i++) {
    if (_name(node.attrs[i].attrName) === attrName) {
      return node.attrs[i].attrValue.string || node.attrs[i].attrValue.lexeme;
    }
  }
}

class Visitor {

  static get supportGenerateTest() {
    return true;
  }

  constructor(option = {}) {
    this.config = {
      outputDir: '',
      indent: '    ',
      packageName: '',
      clientPath: option.testFile === true ? 'test/client.spec.ts' : 'src/client.ts',
      ...option
    };
    this.output = '';
    this.outputDir = option.outputDir;
    this.__module = {};
    this.__externModule = new Map();
    this.modelPath = 'src/models';
    this.exceptionPath = 'src/exceptions';

    this.config.libraries = this.config.libraries || {};
    this.typedef = option.ts && option.ts.typedef ? option.ts.typedef : {};
    this.exports = option.exports ? option.exports : {};
    this.typedefImport = [];
    this.moduleExport = [];
    Object.keys(this.typedef).forEach(type => {
      if (type.import && !this.typedefImport.includes(type.import)) {
        this.typedefImport.push(type.import);
      }
    });

    // Object.keys(this.exports).forEach(moduleName => {
    //   const modulePath = path.resolve(__dirname, this.exports[moduleName]);
    //   const mainPath = path.resolve(__dirname, this.main);
    //   this.moduleExport.push({
    //     name: moduleName,
    //     path: path.relative(path.dirname(mainPath), modulePath)
    //   });
    // });

    if (!this.outputDir) {
      throw new Error('`option.outputDir` should not empty');
    }

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, {
        recursive: true
      });
    }
    this.package = {};
    const packagePath = path.join(this.outputDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        this.package = JSON.parse(fs.readFileSync(packagePath));
      } catch (err) {
        throw new Error('invalid package.json');
      }
    }
    this.initPackage();
  }

  saveTsConfig(tsConfigPath) {
    const config = {
      compilerOptions: {
        target: 'es2017',
        module: 'commonjs',
        declaration: true,
        sourceMap: true,
        outDir: './dist',
        esModuleInterop: true
      },
      include: [
        'src/**/*'
      ]
    };
    fs.writeFileSync(tsConfigPath, JSON.stringify(config, null, 2));
  }

  initPackage() {
    this.package.name = this.package.name || this.config.packageName;
    this.package.version = this.package.version || '1.0.0';
    this.package.description = this.package.description || '';
    this.package.main = this.package.main || 'dist/client.js';
    if (!this.package.scripts) {
      this.package.scripts = {
        test: 'mocha --reporter spec --timeout 3000 test/*.test.js',
        'test-cov': 'nyc -e .ts -r=html -r=text -r=lcov npm run test',
        build: 'tsc',
        prepublishOnly: 'tsc'
      };
    }
    this.package.author = this.package.author || '';
    this.package.license = this.package.license || 'ISC';
    if (!this.package.devDependencies) {
      this.package.devDependencies = {
        '@types/node': '^12.12.26',
        nyc: '^15.0.0',
        'source-map-support': '^0.5.16',
        'ts-node': '^8.6.2',
        typescript: '^3.7.5'
      };
    }
    if (!this.package.dependencies) {
      this.package.dependencies = {
        '@darabonba/typescript': '^1.0.0'
      };
    }

    Object.keys(this.typedef).forEach(type => {
      if (this.typedef[type].package) {
        let [pkgName, version] = this.typedef[type].package.split(':');
        if (!this.package.dependencies[pkgName]) {
          this.package.dependencies[pkgName] = version;
        }
      }
    });

    if (!this.package.files) {
      this.package.files = [
        'dist',
        'src'
      ];
    }
  }

  saveInnerModule(ast, targetPath) {
    const keys = ast.innerModule.keys();
    let data = keys.next();
    while (!data.done) {
      const aliasId = data.value;
      const moduleAst = ast.innerDep.get(aliasId);

      const filepath = path.join(path.dirname(targetPath), ast.innerModule.get(aliasId));
      this.modelPath = filepath.replace('.ts', 'Models');
      this.exceptionPath = filepath.replace('.ts', 'Exceptions');
      this.visitModule(moduleAst, filepath, 0);
      data = keys.next();
    }
  }

  visitHeader() {
    this.header = '';
    if (this.config.editable !== true) {
      this.header += `// This file is auto-generated, don't edit it\n`;
    }
    let str = '';
    if (this.usedTypes.includes('Readable')) {
      str += 'Readable';
    }

    if (this.usedTypes.includes('Writable')) {
      str += ', Writable';
    }

    if (str) {
      this.header += `import { ${str} } from 'stream';\n`;
    }
    this.header += `import * as $dara from '@darabonba/typescript';\n`;
    this.typedefImport.forEach(type => {
      if(!this.moudleUsed.includes(type)) {
        return;
      }
      this.header += `import * as ${type} from '${type}';\n`;
    });
    // this.emit(`\n`);

    [...new Set(this.subModelUsed)].map(modelName => {
      this.header += `import { ${modelName} } from "./${_avoidModel(_camelCase(_snakeCase(this.subModelMap[modelName] || modelName)))}";\n`;
    });

    [...new Set(this.exceptionUsed)].map(ExceptionName => {
      this.header += `import { ${ExceptionName}Error } from "./${_camelCase(_snakeCase(ExceptionName))}Error";\n`;
    });
    

    Object.keys(this.headerImport).map(aliasId => {
      if(!this.modelUsed.includes(aliasId) && !this.moudleUsed.includes(aliasId)) {
        return;
      }
      const { pkgName, inner } = this.headerImport[aliasId];
      this.header += 'import ';
      let sep = false;

      if(this.moudleUsed.includes(aliasId)) {
        if(inner) {
          this.header += `{ ${inner}${inner !== aliasId ? ` as ${aliasId}` : ''}`;
        } else {
          this.header += `${aliasId}`;
        }
        sep = true;
      }
    
      if(this.modelUsed.includes(aliasId)) {
        if(inner) {
          this.header += `${sep ? ', ' : ''}$${inner}${inner !== aliasId ? ` as $${aliasId}` : ''} }`;
        } else {
          this.header += `${sep ? ', ' : ''}* as $${aliasId} `;
        }
      } else {
        this.header += ` ${inner ? '}' : ''}`;
      }

      this.header += `from '${pkgName}';\n`;
    });
    this.output = this.header + '\n\n' + this.output;
  }

  save(filepath, noHeader = false) {
    const targetPath = path.join(this.outputDir, filepath);
    const packagePath = path.join(this.outputDir, 'package.json');

    fs.mkdirSync(path.dirname(targetPath), {
      recursive: true
    });

    if(!noHeader) {
      this.visitHeader();
    }

    fs.writeFileSync(targetPath, this.output);
    if (!fs.existsSync(packagePath)) {
      fs.writeFileSync(packagePath, JSON.stringify(this.package, null, 2));
    }
    const tsConfigPath = path.join(this.outputDir, 'tsconfig.json');
    if (!fs.existsSync(tsConfigPath)) {
      this.saveTsConfig(tsConfigPath);
    }
    this.output = '';
  }

  emit(str, level) {
    this.output += ' '.repeat(level * 2) + str;
  }

  visit(ast, level = 0) {
    this.visitModule(ast, this.config.clientPath, level);
  }

  overwrite(ast, filepath) {
    if(!ast.moduleBody.nodes || !ast.moduleBody.nodes.length) {
      return;
    }
    const beginNotes = DSL.note.getNotes(this.notes, 0, ast.moduleBody.nodes[0].tokenRange[0]);
    const overwirte = beginNotes.find(note => note.note.lexeme === '@overwrite');
    const targetPath = path.join(this.outputDir, filepath);
    if(overwirte && overwirte.arg.value === false && fs.existsSync(targetPath)) {
      return false;
    }
    return true;
  }

  visitModule(ast, filepath, level) {
    assert.equal(ast.type, 'module');
    this.predefined = ast.models;
    this.usedExternException = ast.usedExternException;
    this.parentModule = ast.extends;
    this.comments = ast.comments;
    this.notes = ast.notes;
    this.builtin = getBuiltin(this);
    ast.innerModule = new Map();
    this.headerImport = {};
    this.usedTypes = [];
    this.modelUsed = [];
    this.moudleUsed = [];
    this.subModelUsed = [];
    this.exceptionUsed = [];
    this.fileBuffer = {};
    this.hasException = false;
    this.hasModel = false;
    this.subModelMap = {};
    if(this.overwrite(ast, filepath) === false) {
      return;
    }
    this.importBefore(level);

    this.visitAnnotation(ast.annotation, level);

    this.eachImport(ast.imports, ast.usedExternModel, ast.innerModule, level);

    this.modelBefore(ast);

    const subModels = Object.keys(this.predefined).filter((key) => {
      return !key.startsWith('$') && this.predefined[key].type === 'model' && key.indexOf('.') !== -1;
    }).map((key) => {
      return this.predefined[key];
    });

    for (let i = 0; i < subModels.length; i++) {
      this.eachSubModel(subModels[i], level);
    }

    const models = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'model';
    });

    for (let i = 0; i < models.length; i++) {
      this.eachModel(models[i], level);
    }
    this.visitModelIndex(subModels, models);

    const exceptions = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'exception';
    });

    for (let i = 0; i < exceptions.length; i++) {
      this.eachException(exceptions[i], level);
    }

    this.visitExceptionIndex(exceptions);

    this.flushBuffer();

    this.moduleBefore(ast);
    // models definition
    this.apiBefore(level);
    const types = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'type';
    });

    const inits = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'init';
    });

    const [init] = inits;
    if (init) {
      this.visitInit(init, types, level);
    }

    const apis = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'api';
    });

    for (let i = 0; i < apis.length; i++) {
      if (i !== 0) {
        this.emit('\n');
      }

      this.eachAPI(apis[i], level + 1);
    }

    this.functionBefore();
    const functions = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'function';
    });

    for (let i = 0; i < functions.length; i++) {
      if (i !== 0) {
        this.emit('\n');
      }

      this.eachFunction(functions[i], level + 1);
    }

    this.moduleAfter();
    if (this.config.exec) {
      this.emitExec();
    }
    this.save(filepath);
    this.saveInnerModule(ast, filepath);
  }

  emitExec() {
    this.emit(`
Client.main(process.argv.slice(2));`);
  }

  visitComments(comments, level) {
    comments.forEach(comment => {
      this.emit(`${comment.value}`, level);
      this.emit(`\n`);
    });
  }

  visitAnnotation(annotation, level) {
    if (!annotation || !annotation.value) {
      return;
    }
    let comments = DSL.comment.getFrontComments(this.comments, annotation.index);
    this.visitComments(comments, level);
    var ast = Annotation.parse(annotation.value);
    var description = ast.items.find((item) => {
      return item.type === 'description';
    });
    var summary = ast.items.find((item) => {
      return item.type === 'summary';
    });
    var _return = ast.items.find((item) => {
      return item.type === 'return';
    });
    var deprecated = ast.items.find((item) => {
      return item.type === 'deprecated';
    });
    var params = ast.items.filter((item) => {
      return item.type === 'param';
    }).map((item) => {
      return {
        name: item.name.id,
        text: item.text.text.trimEnd()
      };
    });
    var throws = ast.items.filter((item) => {
      return item.type === 'throws';
    }).map((item) => {
      return item.text.text.trimEnd();
    });

    const descriptionText = description ? description.text.text.trimEnd() : '';
    const summaryText = summary ? summary.text.text.trimEnd() : '';
    const returnText = _return ? _return.text.text.trimEnd() : '';
    let hasNextSection = false;

    this.emit(`/**\n`, level);
    if (summaryText !== '') {
      summaryText.split('\n').forEach((line) => {
        this.emit(` * ${line}\n`, level);
      });
      hasNextSection = true;
    }
    if (descriptionText !== '') {
      if (hasNextSection) {
        this.emit(` * \n`, level);
      }
      this.emit(` * @remarks\n`, level);
      descriptionText.split('\n').forEach((line) => {
        this.emit(` * ${line}\n`, level);
      });
      hasNextSection = true;
    }
    if (deprecated) {
      if (hasNextSection) {
        this.emit(` * \n`, level);
      }
      const deprecatedText = deprecated.text.text.trimEnd();
      this.emit(` * @deprecated`, level);
      deprecatedText.split('\n').forEach((line, index) => {
        if (index === 0) {
          this.emit(` ${line}\n`);
        } else {
          this.emit(` * ${line}\n`, level);
        }
      });
      hasNextSection = true;
    }
    if (params.length > 0) {
      if (hasNextSection) {
        this.emit(` * \n`, level);
      }
      params.forEach((item) => {
        // 遵循 TSDoc 风格：@param x - The first input number
        this.emit(` * @param ${item.name} - `, level);
        const items = item.text.trimEnd().split('\n');
        items.forEach((line, index) => {
          if (index === 0) {
            this.emit(`${line}\n`);
          } else {
            this.emit(` * ${line}\n`, level);
          }
        });
      });
    }
    if (returnText !== '') {
      this.emit(` * @returns`, level);
      const returns = returnText.split('\n');
      returns.forEach((line, index) => {
        if (index === 0) {
          this.emit(` ${line}\n`);
        } else {
          this.emit(` * ${line}\n`, level);
        }
      });
    }
    if (throws.length > 0) {
      this.emit(` * \n`, level);
      throws.forEach((item) => {
        this.emit(' * @throws', level);
        const items = item.trimEnd().split('\n');
        items.forEach((line, index) => {
          if (index === 0) {
            this.emit(` ${line}\n`);
          } else {
            this.emit(` * ${line}\n`, level);
          }
        });
      });
    }
    this.emit(` */`, level);
    this.emit(`\n`);
  }

  visitInit(ast, types, level) {
    assert.equal(ast.type, 'init');
    types.forEach((item) => {
      let comments = DSL.comment.getFrontComments(this.comments, item.tokenRange[0]);
      this.visitComments(comments, level + 1);
      this.emit(`${_vid(item.vid)}: `, level + 1);
      this.visitType(item.value);
      this.emit(`;\n`);
    });
    this.emit('\n');
    this.visitAnnotation(ast.annotation, level + 1);
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level + 1);
    this.emit(`constructor`, level + 1);
    this.visitParams(ast.params, level);
    this.emit(` {\n`);
    if (ast.initBody) {
      this.visitStmts(ast.initBody, level + 2);
    }

    this.emit(`}\n`, level + 1);
    this.emit(`\n`);
  }

  eachImport(imports, usedModels, innerModule, level) {
    this.imports = new Map();
    this.moduleTypedef = {};
    if (imports.length > 0) {
      const lockPath = path.join(this.config.pkgDir, '.libraries.json');
      const lock = fs.existsSync(lockPath) ? JSON.parse(fs.readFileSync(lockPath, 'utf8')) : {};
      for (let i = 0; i < imports.length; i++) {
        const item = imports[i];
        let comments = DSL.comment.getFrontComments(this.comments, item.tokenRange[0]);
        this.visitComments(comments, level);
        const aliasId = item.lexeme;
        const main = item.mainModule;
        const inner = item.module;
        const moduleDir = main ? this.config.libraries[main] : this.config.libraries[aliasId];
        const innerPath = item.innerPath;
        this.headerImport[aliasId] = {};
        // when test.ts import own client.ts
        if (!moduleDir) {
          this.headerImport[aliasId].pkgName = '../src/client';
          if (innerPath) {
            const tsPath = innerPath.replace(/(\.tea)$|(\.spec)$|(\.dara)$/gi, '');
            innerModule.set(aliasId, `${tsPath}.ts`);
            this.headerImport[aliasId].pkgName = tsPath;
          }
          continue;
        }
        let targetPath = '';
        if (moduleDir.startsWith('./') || moduleDir.startsWith('../')) {
          targetPath = path.join(this.config.pkgDir, moduleDir);
        } else if (moduleDir.startsWith('/')) {
          targetPath = moduleDir;
        } else {
          targetPath = path.join(this.config.pkgDir, lock[moduleDir]);
        }
        const pkgPath = fs.existsSync(path.join(targetPath, 'Teafile')) ? path.join(targetPath, 'Teafile') : path.join(targetPath, 'Darafile');
        const pkg = JSON.parse(fs.readFileSync(pkgPath));
        const tsPkg = pkg.releases && pkg.releases.ts;
        if (!tsPkg) {
          throw new Error(`The '${aliasId}' has no TypeScript supported.`);
        }
        const [pkgName, version] = tsPkg.split(':');
        this.package.dependencies[pkgName] = `${version}`;
        this.headerImport[aliasId].pkgName = pkgName;
        if(inner) {
          this.headerImport[aliasId].inner = inner;
        } else {
          this.imports.set(aliasId, pkgName);
        }
        const typedef = pkg.ts && pkg.ts.typedef || {};
        this.moduleTypedef[aliasId] = typedef;
        Object.keys(typedef).forEach(type => {
          if (typedef[type].import && !this.typedefImport.includes(typedef[type].import)) {
            this.typedefImport.push(typedef[type].import);
          }
          if (typedef[type].package) {
            let [pack, ver] = typedef[type].package.split(':');
            if (!this.package.dependencies[pack]) {
              this.package.dependencies[pack] = ver;
            }
          }
        });
      }
      this.__externModule = usedModels;
    }
  }

  visitTypedef(type, module) {
    if (module && module.idType === 'module') {
      const aliasId = _name(module);
      if (this.moduleTypedef[aliasId] && this.moduleTypedef[aliasId][type]) {
        let typeInfo = [];
        if (this.moduleTypedef[aliasId][type].import) {
          this.moudleUsed.push(this.moduleTypedef[aliasId][type].import);
          typeInfo.push(this.moduleTypedef[aliasId][type].import);
        }
        if (this.moduleTypedef[aliasId][type].type) {
          typeInfo.push(this.moduleTypedef[aliasId][type].type);
        }
        return typeInfo.join('.');
      }
    }
    if (type.idType === 'typedef' && this.typedef[type.lexeme]) {
      if (this.typedef[type.lexeme]) {
        let typeInfo = [];
        if (this.typedef[type.lexeme].import) {
          this.moudleUsed.push(this.typedef[type.lexeme].import);
          typeInfo.push(this.typedef[type.lexeme].import);
        }
        if (this.typedef[type.lexeme].type) {
          typeInfo.push(this.typedef[type.lexeme].type);
        }

        return  typeInfo.join('.');
      }
    }
    return _type(type, this.usedTypes);
  }

  visitParams(ast, level) {
    assert.equal(ast.type, 'params');
    this.emit('(');
    for (var i = 0; i < ast.params.length; i++) {
      if (i !== 0) {
        this.emit(', ');
      }
      const node = ast.params[i];
      assert.equal(node.type, 'param');
      const name = _name(node.paramName);
      this.emit(`${avoidReserveName(name)}: `);
      this.visitType(node.paramType, level);
    }
    this.emit(')');
  }

  visitModuleName(aliasId, type) {
    if(type === 'model') {
      this.modelUsed.push(aliasId);
      this.emit(`$${aliasId}.`);
      return;
    }
    this.moudleUsed.push(aliasId);
    this.emit(`${aliasId}`);
  }

  visitType(ast, level) {
    if (ast.type === 'array') {
      this.visitType(ast.subType, level);
      this.emit(`[]`);
    } else if (ast.type === 'moduleModel') {
      const [moduleId, ...rest] = ast.path;
      const modelName = _subModelName(rest.map((item) => item.lexeme).join('.'));
      this.visitModuleName(moduleId.lexeme, 'model');
      this.emit(`${modelName}`);
      const externEx = this.usedExternException.get(_name(moduleId));
      if (externEx && externEx.has(modelName)) {
        this.emit('Error');
      }
    } else if (ast.type === 'subModel') {
      const [moduleId, ...rest] = ast.path;
      const modelName = _subModelName([moduleId.lexeme, ...rest.map((item) => {
        return item.lexeme;
      })].join('.'));
      this.emit(`$_model.${modelName}`);
    } else if (ast.type === 'moduleTypedef') {
      const [moduleId, ...rest] = ast.path;
      const type = rest.map((item) => { return item.lexeme; }).join('.');
      this.emit(this.visitTypedef(type, moduleId));
    } else if (ast.type === 'typedef' || ast.idType === 'typedef') {
      this.emit(this.visitTypedef(ast));
    } else if (ast.type === 'map') {
      this.emit(`{[key: `);
      this.visitType(ast.keyType, level);
      this.emit(` ]: `);
      this.visitType(ast.valueType, level);
      this.emit(`}`);
    } else if (ast.type === 'model') {
      let externEx;
      let type = 'model';
      if (ast.moduleName) {
        externEx = this.usedExternException.get(ast.moduleName);
        this.visitModuleName(ast.moduleName, 'model');
      }
      if ((externEx && externEx.has(ast.name)) || 
      (this.predefined[ast.name] && this.predefined[ast.name].isException)) {
        type = 'error';
      }
      if(!ast.moduleName) {
        this.emit(`$_${type}.`);
      }
      this.emit(`${ast.name}`);
      if(type === 'error') {
        this.emit('Error');
      }      
    } else if(ast.idType === 'model') {
      let externEx;
      let type = 'model';
      if (ast.moduleName) {
        externEx = this.usedExternException.get(ast.moduleName);
        this.visitModuleName(ast.moduleName, 'model');
      }
      if (externEx && externEx.has(ast.lexeme) ||
      (this.predefined[ast.lexeme] && this.predefined[ast.lexeme].isException)) {
        type = 'error';
      }
      if(!ast.moduleName) {
        this.emit(`$_${type}.`);
      }
      this.emit(`${ast.lexeme}`);
      if(type === 'error') {
        this.emit('Error');
      }  
    } else if (ast.idType === 'module' || ast.type === 'module') {
      this.visitModuleName(_name(ast), 'module');
    } else if (this.isIterator(ast)) {
      this.visitType(ast.valueType);
    } else if (ast.type === 'entry') {
      this.emit('[string, ');
      this.visitType(ast.valueType);
      this.emit(']');
    } else if(this.predefined[_name(ast)]) {
      let type = this.predefined[_name(ast)].isException ? 'error' : 'model';
      this.emit(`$_${type}.${_name(ast)}`);
      if(type === 'error') {
        this.emit('Error');
      }      
    } else {
      this.emit(_type(_name(ast), this.usedTypes));
    }
  }

  visitReturnType(ast, level) {
    this.emit(`: `);
    if (ast.returnType.type === 'asyncIterator') {
      this.emit(`AsyncGenerator<`);
    } else if (ast.isAsync) {
      this.emit(`Promise<`);
    }
    if (ast.returnType.type === 'iterator') {
      this.emit(`Generator<`);
    }
    this.visitType(ast.returnType, level);
    if (this.isIterator(ast.returnType)) {
      this.emit(', any, unknown>');
    }
    if (ast.isAsync && ast.returnType.type !== 'asyncIterator') {
      this.emit(`>`);
    } 
    this.emit(` `);
  }

  visitAPIBody(ast, level) {
    assert.equal(ast.type, 'apiBody');
    this.emit(`let ${REQUEST} = new ${CORE}.Request();\n`, level);
    this.visitStmts(ast.stmts, level);
  }

  visitRuntimeBefore(ast, level) {
    assert.equal(ast.type, 'object');
    this.emit('let _runtime: { [key: string]: any } = ', level);
    this.visitObject(ast, level);
    this.emit('\n');
    this.emit('\n');
    this.emit('let _retriesAttempted = 0;\n', level);
    this.emit('let _lastRequest = null, _lastResponse = null;\n', level);
    this.emit(`let _context = new ${CORE}.RetryPolicyContext({\n`, level);
    this.emit('retriesAttempted: _retriesAttempted,\n', level + 1);
    this.emit('});\n', level);
    this.emit(`while (${CORE}.shouldRetry(_runtime['retryOptions'], _context)) {\n`, level);
    this.emit('if (_retriesAttempted > 0) {\n', level + 1);
    this.emit(`let _backoffTime = ${CORE}.getBackoffDelay(_runtime['retryOptions'], _context);\n`, level + 2);
    this.emit('if (_backoffTime > 0) {\n', level + 2);
    this.emit(`await ${CORE}.sleep(_backoffTime);\n`, level + 3);
    this.emit('}\n', level + 2);
    this.emit('}\n', level + 1);
    this.emit('\n');
    this.emit('_retriesAttempted = _retriesAttempted + 1;\n', level + 1);
    this.emit('try {\n', level + 1);
  }

  visitStmt(ast, level) {
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    if (ast.type === 'return') {
      this.visitReturn(ast, level);
    } else if (ast.type === 'yield') {
      this.visitYield(ast, level);
    } else if (ast.type === 'if') {
      this.visitIf(ast, level);
    } else if (ast.type === 'throw') {
      this.visitThrow(ast, level);
    } else if (ast.type === 'assign') {
      this.visitAssign(ast, level);
    } else if (ast.type === 'retry') {
      this.visitRetry(ast, level);
    } else if (ast.type === 'break') {
      this.emit(`break;\n`, level);
    } else if (ast.type === 'declare') {
      this.visitDeclare(ast, level);
    } else if (ast.type === 'while') {
      this.visitWhile(ast, level);
    } else if (ast.type === 'for') {
      this.visitFor(ast, level);
    } else if (ast.type === 'try') {
      this.visitTry(ast, level);
    } else {
      this.emit(``, level);
      this.visitExpr(ast, level);
      this.emit(';\n');
    }
  }

  visitFieldType(value, level, modelName, fieldName) {
    if (value.type === 'modelBody') {
      const subModelName = _subModelName([modelName, fieldName].join('.'));
      this.emit(subModelName);
    } else if (value.type === 'array') {
      this.visitFieldType(value.subType, level, modelName, fieldName);
      this.emit(`[]`);
    } else if (value.fieldType === 'array') {
      this.visitFieldType(value.fieldItemType, level, modelName, fieldName);
      this.emit(`[]`);
    } else if (value.fieldType === 'map') {
      this.emit(`{ [key: ${value.keyType.lexeme}]: `);
      this.visitFieldType(value.valueType);
      this.emit(` }`);
    } else if (value.type === 'map') {
      this.emit(`{ [key: ${value.keyType.lexeme}]: `);
      this.visitFieldType(value.valueType);
      this.emit(` }`);
    } else if (value.tag === Tag.TYPE) {
      this.emit(`${_type(value.lexeme, this.usedTypes)}`);
    } else if (value.tag === Tag.ID) {
      if(this.predefined[value.lexeme]) {
        const arr = this.predefined[value.lexeme].isException ? this.exceptionUsed : this.subModelUsed;
        arr.push(value.lexeme);
      }
      this.emit(`${value.lexeme}`);
    } else if (value.type === 'moduleModel') {
      const [moduleId, ...models] = value.path;
      const modelName = _subModelName(models.map((item) => item.lexeme).join('.'));
      this.visitModuleName(moduleId.lexeme, 'model');
      this.emit(`${modelName}`);
      const externEx = this.usedExternException.get(_name(moduleId.lexeme));
      if (externEx && externEx.has(modelName)) {
        this.emit('Error');
      }
    } else if (value.type === 'subModel') {
      const [moduleId, ...rest] = value.path;
      const subModelName = _subModelName([moduleId.lexeme, ...rest.map((item) => {
        return item.lexeme;
      })].join('.'));
      this.subModelUsed.push(subModelName);
      this.emit(subModelName);
    } else if (typeof value.fieldType === 'string') {
      this.emit(`${_type(value.fieldType, this.usedTypes)}`);
    } else if (value.fieldType.type === 'moduleModel') {
      const [moduleId, ...models] = value.fieldType.path;
      const modelName = _subModelName(models.map((item) => item.lexeme).join('.'));
      this.visitModuleName(moduleId.lexeme, 'model');
      this.emit(`${modelName}`);
      const externEx = this.usedExternException.get(_name(moduleId.lexeme));
      if (externEx && externEx.has(modelName)) {
        this.emit('Error');
      }
    } else if (value.fieldType.type === 'moduleTypedef') {
      const [moduleId, ...rest] = value.fieldType.path;
      const type = rest.map((item) => { return item.lexeme; }).join('.');
      this.emit(this.visitTypedef(type, moduleId));
    } else if (value.fieldType.type === 'typedef' || value.fieldType.idType === 'typedef') {
      this.emit(this.visitTypedef(value.fieldType));
    } else if (value.fieldType.type) {
      this.emit(`${_type(value.fieldType.lexeme, this.usedTypes)}`);
    } else if (value.fieldType.idType === 'model') {
      let arr = this.subModelUsed;
      let type = _type(value.fieldType.lexeme, this.usedTypes);
      if (this.predefined[type] && this.predefined[type].isException) {
        type += 'Error';
        arr = this.exceptionUsed;
      }
      arr.push(type);
      this.emit(type);
    } else if (value.fieldType.idType === 'module') {
      this.visitModuleName(_type(value.fieldType.lexeme, this.usedTypes), 'moudle');
    } else if (value.fieldType.idType === 'builtin_model') {
      this.emit(`${_type(value.fieldType.lexeme, this.usedTypes)}`);
    }
  }

  visitFieldTypeString(value, level, modelName, fieldName) {
    if (value.type === 'modelBody') {
      this.emit(_subModelName([modelName, fieldName].join('.')));
    } else if (value.type === 'array') {
      this.emit(`{ 'type': 'array', 'itemType': `);
      this.visitFieldTypeString(value.subType, level, modelName, fieldName);
      this.emit(` }`);
    } else if (value.fieldType === 'array') {
      this.emit(`{ 'type': 'array', 'itemType': `);
      this.visitFieldTypeString(value.fieldItemType, level, modelName, fieldName);
      this.emit(` }`);
    } else if (value.fieldType === 'map') {
      this.emit(`{ 'type': 'map', 'keyType': '${value.keyType.lexeme}', 'valueType': `);
      this.visitFieldTypeString(value.valueType);
      this.emit(` }`);
    } else if (value.type === 'map') {
      this.emit(`{ 'type': 'map', 'keyType': '${value.keyType.lexeme}', 'valueType': `);
      this.visitFieldTypeString(value.valueType);
      this.emit(` }`);
    } else if (value.fieldType === 'object') {
      this.emit(`{ 'type': 'map', 'keyType': 'string', 'valueType': 'any' }`);
    } else if (value.tag === Tag.TYPE) {
      this.emit(`'${_type(value.lexeme)}'`);
    } else if (value.tag === Tag.ID) {
      this.emit(`${_type(value.lexeme)}`);
    } else if (value.type === 'moduleModel') {
      const [moduleId, ...models] = value.path;
      const modelName = _subModelName(models.map((item) => item.lexeme).join('.'));
      this.emit(`$${moduleId.lexeme}.${modelName}`);
      const externEx = this.usedExternException.get(_name(moduleId.lexeme));
      if (externEx && externEx.has(modelName)) {
        this.emit('Error');
      }
    } else if (value.type === 'subModel') {
      const [moduleId, ...rest] = value.path;
      this.emit(_subModelName([moduleId.lexeme, ...rest.map((item) => {
        return item.lexeme;
      })].join('.')));
    } else if (typeof value.fieldType === 'string') {
      this.emit(`'${_type(value.fieldType)}'`);
    } else if (value.fieldType.type === 'moduleModel') {
      const [moduleId, ...models] = value.fieldType.path;
      const modelName = _subModelName(models.map((item) => item.lexeme).join('.'));
      this.emit(`$${moduleId.lexeme}.${modelName}`);
      const externEx = this.usedExternException.get(_name(moduleId.lexeme));
      if (externEx && externEx.has(modelName)) {
        this.emit('Error');
      }
    } else if (value.fieldType.type === 'moduleTypedef') {
      const [moduleId, ...rest] = value.fieldType.path;
      const type = rest.map((item) => { return item.lexeme; }).join('.');
      this.emit(this.visitTypedef(type, moduleId));
    } else if (value.fieldType.type === 'typedef' || value.fieldType.idType === 'typedef') {
      let type = this.visitTypedef(value.fieldType);
      if(DSL.util.isBasicType(type)) {
        type = `'${_type(type)}'`;
      }
      this.emit(type);
    } else if (value.fieldType.type) {
      this.emit(`${_type(value.fieldType.lexeme)}`);
    } else if (value.fieldType.idType === 'model') {
      const type = _type(value.fieldType.lexeme);
      if (this.predefined[_name(type)] && this.predefined[_name(type)].isException) {
        return `${_name(type)}Error`;
      }
      this.emit(type);
    } else if (value.fieldType.idType === 'module') {
      this.emit(`${_type(value.fieldType.lexeme)}`);
    } else if (value.fieldType.idType === 'builtin_model') {
      this.emit(`${_type(value.fieldType.lexeme)}`);
    }
  }

  visitModelBody(ast, level, modelName) {
    assert.equal(ast.type, 'modelBody');
    let node;
    for (let i = 0; i < ast.nodes.length; i++) {
      node = ast.nodes[i];
      let comments = DSL.comment.getFrontComments(this.comments, node.tokenRange[0]);
      const description = getAttr(node, 'description');
      const example = getAttr(node, 'example');
      const checkBlank = getAttr(node, 'checkBlank');
      const nullable = getAttr(node, 'nullable');
      const sensitive = getAttr(node, 'sensitive');
      const deprecated = getAttr(node, 'deprecated');
      let hasNextSection = false;
      if (deprecated === 'true' || description || example || typeof checkBlank !== 'undefined' || typeof nullable !== 'undefined' || typeof sensitive !== 'undefined') {
        this.emit('/**\n', level);
        if (description) {
          this.emit(' * @remarks\n', level);
          const descriptions = description.split('\n');
          for (let j = 0; j < descriptions.length; j++) {
            if (descriptions[j] === '') {
              this.emit(` * \n`, level);
            } else {
              this.emit(` * ${descriptions[j]}\n`, level);
            }
          }
          hasNextSection = true;
        }
        if (example) {
          if (hasNextSection) {
            this.emit(` * \n`, level);
          }
          const examples = example.split('\n');
          this.emit(' * @example\n', level);
          for (let j = 0; j < examples.length; j++) {
            if (examples[j] === '') {
              this.emit(` * \n`, level);
            } else {
              this.emit(` * ${examples[j]}\n`, level);
            }
          }
          hasNextSection = true;
        }
        if (typeof checkBlank !== 'undefined') {
          if (hasNextSection) {
            this.emit(` * \n`, level);
          }
          this.emit(' * **check if is blank:**\n', level);
          this.emit(` * ${checkBlank}\n`, level);
          hasNextSection = true;
        }
        if (typeof nullable !== 'undefined') {
          if (hasNextSection) {
            this.emit(` * \n`, level);
          }
          this.emit(' * **if can be null:**\n', level);
          this.emit(` * ${nullable}\n`, level);
          hasNextSection = true;
        }
        if (typeof sensitive !== 'undefined') {
          if (hasNextSection) {
            this.emit(` * \n`, level);
          }
          this.emit(' * **if sensitive:**\n', level);
          this.emit(` * ${sensitive}\n`, level);
          hasNextSection = true;
        }
        if (deprecated === 'true') {
          if (hasNextSection) {
            this.emit(` * \n`, level);
          }
          this.emit(` * @deprecated\n`, level);
        }
        this.emit(' */\n', level);
      }
      this.visitComments(comments, level);
      this.emit(`${_escape(_name(node.fieldName))}${node.required ? '' : '?'}: `, level);
      this.visitFieldType(node.fieldValue, level, modelName, _name(node.fieldName));
      this.emit(';\n');
    }
    if (node) {
      //find the last node's back comment
      let comments = DSL.comment.getBetweenComments(this.comments, node.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level);
    }

    if (ast.nodes.length === 0) {
      //empty block's comment
      let comments = DSL.comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level);
    }

    this.emit(`static names(): { [key: string]: string } {\n`, level);
    this.emit(`return {\n`, level + 1);
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      const nameAttr = node.attrs.find((item) => {
        return item.attrName.lexeme === 'name';
      });
      if (nameAttr) {
        this.emit(`${_escape(_name(node.fieldName))}: '${_string(nameAttr.attrValue)}',\n`, level + 2);
      } else {
        this.emit(`${_escape(_name(node.fieldName))}: '${_name(node.fieldName)}',\n`, level + 2);
      }
    }
    this.emit(`};\n`, level + 1);
    this.emit(`}\n`, level);

    this.emit('\n');
    this.emit(`static types(): { [key: string]: any } {\n`, level);
    this.emit(`return {\n`, level + 1);
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      this.emit(`${_escape(_name(node.fieldName))}: `, level + 2);
      this.visitFieldTypeString(node.fieldValue, level + 2, modelName, _name(node.fieldName));
      this.emit(',\n');
    }
    this.emit(`};\n`, level + 1);
    this.emit(`}\n`, level);
    this.emit('\n');

    this.emit(`validate() {\n`, level);
    this.visitModelValidate(ast, level + 1);
    this.emit(`}\n`, level);
  }

  getAttributes(ast, name){
    const attr = ast.attrs.find((item) => {
      return item.attrName.lexeme === name;
    });
    if(!attr) {
      return;
    }
    return attr.attrValue.string || attr.attrValue.lexeme || attr.attrValue.value;
  }

  visitFieldValidate(value, level, name) {
    if (value.type === 'array' || value.fieldType === 'array') {
      this.emit(`if(Array.isArray(${name})) {\n`, level);
      this.emit(`$dara.Model.validateArray(${name});\n`, level + 1);
      this.emit('}\n', level);
    } else if (value.fieldType === 'map' || value.type === 'map') {
      this.emit(`if(${name}) {\n`, level);
      this.emit(`$dara.Model.validateMap(${name});\n`, level + 1);
      this.emit('}\n', level);
    } else if (value.type === 'moduleModel' || value.type === 'modelBody'
    || value.type === 'subModel' || value.fieldType.type === 'moduleModel'
    || value.fieldType.idType === 'model' || value.fieldType.idType === 'module') {
      this.emit(`if(${name} && typeof (${name} as any).validate === 'function') {\n`, level);
      this.emit(`(${name} as any).validate();\n`, level + 1);
      this.emit('}\n', level);
    }
  }

  visitModelValidate(ast, level) {
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      this.visitFieldValidate(node.fieldValue, level, `this.${_escape(_name(node.fieldName))}`);
      const attrName = _name(node.fieldName);
      const pattern = this.getAttributes(node, 'pattern') || '';
      const maxLength = this.getAttributes(node, 'maxLength') || 0;
      const minLength = this.getAttributes(node, 'minLength') || 0;
      const maximum = this.getAttributes(node, 'maximum') || 0;
      const minimum = this.getAttributes(node, 'minimum') || 0;
      const required = node.required || false;
      if (required || maxLength > 0 || minLength > 0 || maximum > 0 || pattern !== '') {
        if (required) {
          this.emit(`$dara.Model.validateRequired("${attrName}", this.${attrName});\n`, level);
        }
        if (pattern !== '') {
          this.emit(`$dara.Model.validatePattern("${attrName}", this.${attrName}, "${pattern}");\n`, level);
        }
        if (maxLength > 0 && maxLength <= 2147483647) {
          this.emit(`$dara.Model.validateMaxLength("${attrName}", this.${attrName}, ${maxLength});\n`, level);
        }
        if (minLength > 0 && minLength <= 2147483647) {
          this.emit(`$dara.Model.validateMinLength("${attrName}", this.${attrName}, ${minLength});\n`, level);
        }
        // 不能超过JS中最大安全整数
        if (maximum > 0 && maximum <= Number.MAX_SAFE_INTEGER) {
          this.emit(`$dara.Model.validateMaximum("${attrName}", this.${attrName}, ${maximum});\n`, level);
        }
        // 不能超过JS中最大安全整数
        if (minimum > 0 && minimum <= Number.MAX_SAFE_INTEGER) {
          this.emit(`$dara.Model.validateMinimum("${attrName}", this.${attrName}, ${minimum});\n`, level);
        }
      }
    }
    this.emit('super.validate();\n', level);
  }

  visitExtendOn(extendOn, type = 'model') {
    if (!extendOn) {
      return type === 'model' ? this.emit(`${CORE}.Model`) : this.emit(`${CORE}.BaseError`);
    }

    switch(_name(extendOn)) {
    case '$Error': 
      this.emit(`${CORE}.BaseError`);
      return;
    case '$ResponseError': 
      this.emit(`${CORE}.ResponseError`);
      return;
    case '$Model': 
      this.emit(`${CORE}.Model`);
      return;
    }

    let emitName = '';
    if (extendOn.type === 'moduleModel') {
      const [moduleId, ...rest] = extendOn.path;
      this.visitModuleName(moduleId.lexeme, 'model');
      this.emit(_subModelName(rest.map((item) => {
        return item.lexeme;
      }).join('.')));
    } else if (extendOn.type === 'subModel') {
      const [moduleId, ...rest] = extendOn.path;
      emitName = _subModelName([moduleId.lexeme, ...rest.map((item) => {
        return item.lexeme;
      })].join('.'));
      this.emit(emitName);
    } else {
      const modelName = _upperFirst(_name(extendOn));
      if (extendOn.moduleName) {
        this.visitModuleName(extendOn.moduleName, 'model');
      } else {
        emitName = modelName;
      }
      
      this.emit(modelName);
    }

    if(type === 'model' && emitName) {
      this.subModelUsed.push(emitName);
    }
    if(type === 'exception') {
      if(emitName) {
        this.exceptionUsed.push(emitName);
      }
      this.emit('Error');
    }
  }

  visitModelIndex(subModels, models) {
    if(subModels.length === 0 && models.length === 0) {
      return;
    }
    this.hasModel = true;
    for (let i = 0; i < subModels.length; i++) {
      const ast = subModels[i];
      const modelName = _subModelName(_name(ast.modelName));
      const mainModelName = _subModelName(_name(ast.modelName).split('.')[0]);
      this.emit(`export { ${modelName} } from './${_avoidModel(_camelCase(_snakeCase(mainModelName)))}';\n`);
    }
    
    for (let i = 0; i < models.length; i++) {
      const ast = models[i];
      const modelName = _subModelName(_name(ast.modelName));
      this.emit(`export { ${modelName} } from './${_avoidModel(_camelCase(_snakeCase(modelName)))}';\n`);
    }
    this.save(path.join(this.modelPath, 'model.ts'), true);
  }

  visitModel(modelBody, modelName, extendOn, level, fileName) {
    this.emit(`export class ${modelName} extends `, level);
    this.visitExtendOn(extendOn);
    this.emit(' {\n');
    this.visitModelBody(modelBody, level + 1, modelName);
    this.emit(`\n`);
    this.emit(`constructor(map?: { [key: string]: any }) {\n`, level + 1);
    this.emit(`super(map);\n`, level + 2);
    this.emit(`}\n`, level + 1);
    this.emit('}\n\n', level);

    this.subModelUsed = this.subModelUsed.filter(name => {
      return name !== modelName;
    });
    this.saveBuffer(path.join(this.modelPath, fileName || `${_avoidModel(_camelCase(_snakeCase(modelName)))}.ts`));
    this.usedTypes = [];
    this.modelUsed = [];
    this.moudleUsed = [];
    this.exceptionUsed = [];
    this.subModelUsed = [];
    this.output = '';
  }

  saveBuffer(filepath) {
    if(this.fileBuffer[filepath]) {
      this.fileBuffer[filepath].moudleUsed = this.moudleUsed.concat(this.fileBuffer[filepath].moudleUsed);
      this.fileBuffer[filepath].modelUsed = this.modelUsed.concat(this.fileBuffer[filepath].modelUsed);
      this.fileBuffer[filepath].usedTypes = this.usedTypes.concat(this.fileBuffer[filepath].usedTypes);
      this.fileBuffer[filepath].subModelUsed = this.subModelUsed.concat(this.fileBuffer[filepath].subModelUsed);
      this.fileBuffer[filepath].exceptionUsed = this.exceptionUsed.concat(this.fileBuffer[filepath].exceptionUsed);
      this.fileBuffer[filepath].output = this.fileBuffer[filepath].output + this.output;
      return;
    }

    this.fileBuffer[filepath] = {
      modelUsed: this.modelUsed,
      moudleUsed: this.moudleUsed,
      usedTypes: this.usedTypes,
      output: this.output,
      subModelUsed: this.subModelUsed,
      exceptionUsed: this.exceptionUsed,
    };
  }

  flushBuffer() {
    Object.keys(this.fileBuffer).map(filepath => {
      this.output = this.fileBuffer[filepath].output;
      this.moudleUsed = this.fileBuffer[filepath].moudleUsed;
      this.modelUsed = this.fileBuffer[filepath].modelUsed;
      this.usedTypes = this.fileBuffer[filepath].usedTypes;
      this.exceptionUsed = this.fileBuffer[filepath].exceptionUsed;
      this.subModelUsed = this.fileBuffer[filepath].subModelUsed;
      this.save(filepath);
      this.output = '';
      this.moudleUsed = [];
      this.modelUsed = [];
      this.usedTypes = [];
      this.exceptionUsed = [];
      this.subModelUsed = [];
    });
  }

  eachModel(ast, level) {
    assert.equal(ast.type, 'model');
    const modelName = _upperFirst(_name(ast.modelName));
    this.visitAnnotation(ast.annotation, level);
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    this.visitModel(ast.modelBody, modelName, ast.extendOn, level);
  }

  visitEcxceptionBody(ast, level, ExceptionName) {
    assert.equal(ast.type, 'exceptionBody');
    let node;
    for (let i = 0; i < ast.nodes.length; i++) {
      node = ast.nodes[i];
      const fieldName = _escape(_name(node.fieldName));
      if(fieldName === 'message' || fieldName === 'name' || fieldName === 'code') {
        node.required = true;
      }
      let comments = DSL.comment.getFrontComments(this.comments, node.tokenRange[0]);
      this.visitComments(comments, level);
      this.emit(`${fieldName}${node.required ? '' : '?'}: `, level);
      this.visitFieldType(node.fieldValue, level, ExceptionName, _name(node.fieldName));
      this.emit(';\n');
    }
    if (node) {
      //find the last node's back comment
      let comments = DSL.comment.getBetweenComments(this.comments, node.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level);
    }

    if (ast.nodes.length === 0) {
      //empty block's comment
      let comments = DSL.comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level);
    }
  }

  visitEcxceptionConstrutor(ast, exceptionName, level) {
    assert.equal(ast.type, 'exceptionBody');
    let node;
    for (let i = 0; i < ast.nodes.length; i++) {
      node = ast.nodes[i];
      const fieldName = _escape(_name(node.fieldName));
      if(fieldName === 'message') {
        continue;
      }
      if(fieldName === 'name') {
        continue;
      }
      this.emit(`this.${fieldName} = map.${fieldName};\n`, level);
    }
  }

  visitException(exceptionBody, exceptionName, extendOn, level) {
    this.emit(`export class ${exceptionName}Error extends `, level);
    this.visitExtendOn(extendOn, 'exception');
    this.emit(' {\n');
    this.visitEcxceptionBody(exceptionBody, level + 1, exceptionName);
    this.emit(`\n`);
    this.emit(`constructor(map?: { [key: string]: any }) {\n`, level + 1);
    this.emit(`super(map);\n`, level + 2);
    this.emit(`this.name = "${exceptionName}Error";\n`, level + 2);
    this.emit(`Object.setPrototypeOf(this, ${exceptionName}Error.prototype);\n`, level + 2);
    this.visitEcxceptionConstrutor(exceptionBody, exceptionName, level + 2);
    this.emit(`}\n`, level + 1);
    this.emit('}\n\n', level);

    this.exceptionUsed = this.exceptionUsed.filter(name => {
      return name !== exceptionName;
    });
    this.saveBuffer(path.join(this.exceptionPath, `${_camelCase(_snakeCase(exceptionName))}Error.ts`));
    this.usedTypes = [];
    this.modelUsed = [];
    this.moudleUsed = [];
    this.exceptionUsed = [];
    this.subModelUsed = [];
    this.output = '';
  }

  visitExceptionIndex(exceptions) {
    if(exceptions.length === 0) {
      return;
    }

    this.hasException = true;
    for (let i = 0; i < exceptions.length; i++) {
      const ast = exceptions[i];
      const exceptionName = _subModelName(_name(ast.exceptionName));
      this.emit(`export { ${exceptionName}Error } from './${_camelCase(_snakeCase(exceptionName))}Error';\n`);
    }

    this.save(path.join(this.exceptionPath, 'error.ts'), true);
  }

  eachException(ast, level) {
    assert.equal(ast.type, 'exception');
    const exceptionName = _upperFirst(_name(ast.exceptionName));
    this.visitAnnotation(ast.annotation, level);
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    this.visitException(ast.exceptionBody, exceptionName, ast.extendOn, level);
  }

  eachSubModel(ast, level) {
    assert.equal(ast.type, 'model');
    const modelName = _subModelName(_name(ast.modelName));
    const mainModelName = _subModelName(_name(ast.modelName).split('.')[0]);
    this.subModelMap[modelName] = mainModelName;
    this.visitModel(ast.modelBody, modelName, ast.extendOn, level, `${_avoidModel(_camelCase(_snakeCase(mainModelName)))}.ts`);
  }

  visitObjectFieldValue(ast, level) {
    this.visitExpr(ast, level);
  }

  visitObjectField(ast, level) {
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    if (ast.type === 'objectField') {
      var key = _escape(_name(ast.fieldName) || _string(ast.fieldName));
      this.emit(`${key}: `, level);
      this.visitObjectFieldValue(ast.expr, level);
    } else if (ast.type === 'expandField') {
      // TODO: more cases
      this.emit('...', level);
      this.visitExpr(ast.expr, level);
    } else {
      throw new Error('unimpelemented');
    }
    this.emit(',\n');
  }

  visitObject(ast, level) {
    assert.equal(ast.type, 'object');

    if (ast.fields.length === 0) {
      this.emit('{ ');
      let comments = DSL.comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
      if (comments.length > 0) {
        this.emit('\n');
        this.visitComments(comments, level + 1);
        this.emit('', level);
      }
      this.emit('}');
    } else {
      this.emit('{\n');
      for (var i = 0; i < ast.fields.length; i++) {
        this.visitObjectField(ast.fields[i], level + 1);
      }
      //find the last item's back comment
      let comments = DSL.comment.getBetweenComments(this.comments, ast.fields[i - 1].tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level + 1);
      this.emit('}', level);
    }
  }

  visitMethodCall(ast, level) {
    assert.equal(ast.left.type, 'method_call');
    if (ast.isAsync) {
      this.emit(`await `);
    }
    const name = _name(ast.left.id);
    if (name.startsWith('$') && this.builtin[name]) {
      const method = name.replace('$', '');
      this.builtin[name][method](ast.args, level);
      return;
    } else if (ast.isStatic) {
      this.emit(`Client.${name}`);
    } else {
      this.emit(`this.${name}`);
    }
    this.visitArgs(ast.args, level);
  }

  visitInstanceCall(ast, level) {
    assert.equal(ast.left.type, 'instance_call');
    const method = _name(ast.left.propertyPath[0]);
    if (ast.isAsync) {
      this.emit(`await `);
    }

    if (ast.builtinModule && this.builtin[ast.builtinModule] && this.builtin[ast.builtinModule][method]) {
      this.builtin[ast.builtinModule][method](ast, level);
    } else {
      if (ast.left.id.tag === DSL.Tag.Tag.VID) {
        this.emit(`this.${_vid(ast.left.id)}`);
      } else {
        this.emit(`${_name(ast.left.id)}`);
      }
      this.emit(`.${(method)}`);
      this.visitArgs(ast.args, level);
    }

  }

  visitStaticCall(ast, level) {
    assert.equal(ast.left.type, 'static_call');
    if (ast.isAsync) {
      this.emit(`await `);
    }

    if (ast.left.id.type === 'builtin_module') {
      this.visitBuiltinStaticCall(ast);
      return;
    }
    this.visitModuleName(_name(ast.left.id), 'moudle');
    this.emit(`.${_name(ast.left.propertyPath[0])}`);
    this.visitArgs(ast.args, level);
  }

  visitBuiltinStaticCall(ast) {
    const moduleName = _name(ast.left.id);

    const builtiner = this.builtin[moduleName];
    if (!builtiner) {
      throw new Error('un-implemented');
    }
    const func = _name(ast.left.propertyPath[0]);
    builtiner[func](ast.args);
  }

  visitCall(ast, level) {
    assert.equal(ast.type, 'call');
    if (ast.left.type === 'method_call') {
      this.visitMethodCall(ast, level);
    } else if (ast.left.type === 'instance_call') {
      this.visitInstanceCall(ast, level);
    } else if (ast.left.type === 'static_call') {
      this.visitStaticCall(ast, level);
    } else {
      console.log(ast.left.propertyPath);
      throw new Error('un-implemented');
    }
  }

  visitConstruct(ast, level) {
    assert.equal(ast.type, 'construct');
    this.emit('new ');
    this.visitModuleName(_type(ast.aliasId.lexeme, this.usedTypes), 'moudle');
    this.visitArgs(ast.args, level);
  }

  visitSuper(ast, level) {
    assert.equal(ast.type, 'super');
    this.emit(`super`);
    this.visitArgs(ast.args, level);
  }

  visitArgs(args, level) {
    this.emit('(');
    for (let i = 0; i < args.length; i++) {
      const expr = args[i];
      if (expr.needCast) {
        this.emit('$dara.toMap(');
        this.visitExpr(expr, level);
        this.emit(')');
      } else {
        this.visitExpr(expr, level);
      }
      if (i !== args.length - 1) {
        this.emit(', ');
      }
    }
    this.emit(')');
  }

  visitPropertyAccess(ast) {
    assert.ok(ast.type === 'property_access' || ast.type === 'property');
    var id = _name(ast.id);
    if (ast.id.tag === Tag.VID) {
      id = `this.${_vid(ast.id)}`;
    }
    var expr = avoidReserveName(id);

    var current = ast.id.inferred;
    for (var i = 0; i < ast.propertyPath.length; i++) {
      var name = _name(ast.propertyPath[i]);
      if (current.type === 'model') {
        expr += `.${name}`;
      } else {
        expr += `["${name}"]`;
      }
      current = ast.propertyPathTypes[i];
    }
    this.emit(expr);
  }

  visitExpr(ast, level) {
    if (ast.type === 'boolean') {
      this.emit(ast.value);
    } else if (ast.type === 'property_access') {
      this.visitPropertyAccess(ast);
    } else if (ast.type === 'string') {
      this.emit(`"${_string(ast.value)}"`);
    } else if (ast.type === 'number') {
      this.emit(ast.value.value);
    } else if (ast.type === 'null') {
      this.emit(`null`);
    } else if (ast.type === 'object') {
      this.visitObject(ast, level);
    } else if (ast.type === 'variable') {
      if(ast.inferred &&  ast.inferred.type === 'basic' 
        && ast.inferred.name === 'class' && ast.id.type === 'model') {
        let type = 'model';
        let name = _name(ast.id);
        if (this.predefined[name] && this.predefined[name].isException) {
          type = 'error';
        }
        if(!name.startsWith('$') && this.predefined[name]) {
          this.emit(`$_${type}.`);
        }
        this.emit(_type(name));
      } else {
        this.emit(avoidReserveName(_name(ast.id)));
      }
    } else if (ast.type === 'virtualVariable') {
      this.emit(`this.${_vid(ast.vid)}`);
    } else if (ast.type === 'decrement') {
      if (ast.position === 'front') {
        this.emit('--');
      }
      this.visitExpr(ast.expr, level);
      if (ast.position === 'backend') {
        this.emit('--');
      }
    } else if (ast.type === 'increment') {
      if (ast.position === 'front') {
        this.emit('++');
      }
      this.visitExpr(ast.expr, level);
      if (ast.position === 'backend') {
        this.emit('++');
      }
    } else if (ast.type === 'template_string') {
      this.emit('`');
      for (var i = 0; i < ast.elements.length; i++) {
        var item = ast.elements[i];
        if (item.type === 'element') {
          this.emit(_string(item.value));
        } else if (item.type === 'expr') {
          this.emit('${');
          this.visitExpr(item.expr, level);
          this.emit('}');
        } else {
          throw new Error('unimpelemented');
        }
      }
      this.emit('`');
    } else if (ast.type === 'call') {
      this.visitCall(ast, level);
    } else if (ast.type === 'construct') {
      this.visitConstruct(ast, level);
    } else if (ast.type === 'array') {
      this.visitArray(ast, level);
    } else if (ast.type === 'group') {
      this.emit('(');
      this.visitExpr(ast.expr, level);
      this.emit(')');
    } else if (_isBinaryOp(ast.type)) {
      this.visitExpr(ast.left, level);
      if (ast.type === 'or') {
        this.emit(' || ');
      } else if (ast.type === 'add') {
        this.emit(' + ');
      } else if (ast.type === 'subtract') {
        this.emit(' - ');
      } else if (ast.type === 'div') {
        this.emit(' / ');
      } else if (ast.type === 'multi') {
        this.emit(' * ');
      } else if (ast.type === 'and') {
        this.emit(' && ');
      } else if (ast.type === 'or') {
        this.emit(' || ');
      } else if (ast.type === 'lte') {
        this.emit(' <= ');
      } else if (ast.type === 'lt') {
        this.emit(' < ');
      } else if (ast.type === 'gte') {
        this.emit(' >= ');
      } else if (ast.type === 'gt') {
        this.emit(' > ');
      } else if (ast.type === 'neq') {
        this.emit(' != ');
      } else if (ast.type === 'eq') {
        this.emit(' == ');
      }
      this.visitExpr(ast.right, level);
    } else if (ast.type === 'group') {
      this.emit('(');
      this.visitExpr(ast.expr, level);
      this.emit('(');
    } else if (ast.type === 'not') {
      this.emit('!');
      this.visitExpr(ast.expr, level);
    } else if (ast.type === 'construct_model') {
      this.visitConstructModel(ast, level);
    } else if (ast.type === 'map_access') {
      this.visitMapAccess(ast);
    } else if (ast.type === 'array_access') {
      this.visitArrayAccess(ast);
    } else if (ast.type === 'super') {
      this.visitSuper(ast, level);
    } else {
      throw new Error('unimpelemented');
    }
  }

  visitConstructModel(ast, level) {
    assert.equal(ast.type, 'construct_model');
    if (ast.aliasId.isModule) {
      let moduleName = ast.aliasId.lexeme;
      let modelName = _subModelName(ast.propertyPath.map((item) => {
        return item.lexeme;
      }).join('.'));
      this.emit('new ');
      this.visitModuleName(moduleName, 'model');
      this.emit(modelName);
      const externEx = this.usedExternException.get(moduleName);
      if (externEx && externEx.has(modelName)) {
        this.emit('Error');
      }
    }

    if (ast.aliasId.isModel) {
      let mainModelName = ast.aliasId.lexeme;
      let type = 'model';
      this.emit(`new `);
      mainModelName = _subModelName([mainModelName, ...ast.propertyPath.map((item) => {
        return item.lexeme;
      })].join('.'));
      if(mainModelName.startsWith('$') && !this.predefined[mainModelName]) {
        this.emit(`${_type(mainModelName, this.usedTypes)}`);
      } else {
        if (this.predefined[mainModelName] && this.predefined[mainModelName].isException) {
          type = 'error';
        }
        this.emit(`$_${type}.${_type(mainModelName, this.usedTypes)}`);
        if(type === 'error') {
          this.emit('Error');
        }
      }
    }

    this.emit(`(`);
    if (ast.object) {
      this.visitObject(ast.object, level);
    } else {
      this.emit(`{ }`);
    }
    this.emit(')');
  }

  visitMapAccess(ast, level) {
    assert.equal(ast.type, 'map_access');
    let expr;
    if (ast.id.tag === DSL.Tag.Tag.VID) {
      expr = `this.${_vid(ast.id)}`;
    } else {
      expr = `${_name(ast.id)}`;
    }
    if (ast.propertyPath && ast.propertyPath.length) {
      var current = ast.id.inferred;
      for (var i = 0; i < ast.propertyPath.length; i++) {
        var name = _name(ast.propertyPath[i]);
        if (current.type === 'model') {
          expr += `.${name}`;
        } else {
          expr += `["${name}"]`;
        }
        current = ast.propertyPathTypes[i];
      }
    }
    this.emit(`${expr}[`, level);
    this.visitExpr(ast.accessKey, level);
    this.emit(`]`);
  }

  visitArrayAccess(ast, level) {
    assert.equal(ast.type, 'array_access');
    let expr;
    if (ast.id.tag === DSL.Tag.Tag.VID) {
      expr = `this.${_vid(ast.id)}`;
    } else {
      expr = `${_name(ast.id)}`;
    }
    if (ast.propertyPath && ast.propertyPath.length) {
      var current = ast.id.inferred;
      for (var i = 0; i < ast.propertyPath.length; i++) {
        var name = _name(ast.propertyPath[i]);
        if (current.type === 'model') {
          expr += `.${name}`;
        } else {
          expr += `["${name}"]`;
        }
        current = ast.propertyPathTypes[i];
      }
    }
    this.emit(`${expr}[`, level);
    this.visitExpr(ast.accessKey, level);
    this.emit(`]`);
  }

  visitArray(ast, level) {
    assert.equal(ast.type, 'array');
    let arrayComments = DSL.comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
    if (ast.items.length === 0) {
      this.emit('[ ');
      if (arrayComments.length > 0) {
        this.emit('\n');
        this.visitComments(arrayComments, level + 1);
        this.emit('', level);
      }
      this.emit(']');
      return;
    }

    this.emit('[\n');
    let item;
    for (let i = 0; i < ast.items.length; i++) {
      item = ast.items[i];
      let comments = DSL.comment.getFrontComments(this.comments, item.tokenRange[0]);
      this.visitComments(comments, level + 1);
      this.emit('', level + 1);
      this.visitExpr(item, level + 1);
      if (i < ast.items.length - 1) {
        this.emit(',');
      }
      this.emit('\n');
    }
    if (item) {
      //find the last item's back comment
      let comments = DSL.comment.getBetweenComments(this.comments, item.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level + 1);
    }
    this.emit(']', level);
  }

  visitYield(ast, level) {
    assert.equal(ast.type, 'yield');
    this.emit('yield ', level);
    if (!ast.expr) {
      this.emit(';\n');
      return;
    }

    if (ast.needCast) {
      this.emit(`${CORE}.cast<`);
      this.visitType(ast.expectedType);
      this.emit(`>(`);
    }

    this.visitExpr(ast.expr, level);

    if (ast.needCast) {
      this.emit(`, new `);
      this.visitType(ast.expectedType);
      this.emit('({}))');
    }

    this.emit(';\n');
  }

  visitReturn(ast, level) {
    assert.equal(ast.type, 'return');
    this.emit('return ', level);
    if (!ast.expr) {
      this.emit(';\n');
      return;
    }

    if (ast.needCast) {
      this.emit(`${CORE}.cast<`);
      this.visitType(ast.expectedType);
      this.emit(`>(`);
    }

    this.visitExpr(ast.expr, level);

    if (ast.needCast) {
      this.emit(`, new `);
      this.visitType(ast.expectedType);
      this.emit('({}))');
    }

    this.emit(';\n');
  }

  visitRetry(ast, level) {
    assert.equal(ast.type, 'retry');
    this.emit(`throw $dara.newRetryError(${REQUEST}, ${RESPONSE});\n`, level);
  }

  visitTry(ast, level) {
    assert.equal(ast.type, 'try');
    this.emit('try {\n', level);
    this.visitStmts(ast.tryBlock, level + 1);
    this.emit('}', level);
    if (ast.catchBlocks && ast.catchBlocks.length > 0) {
      this.emit(` catch (__err) {\n`);
      ast.catchBlocks.forEach(catchBlock => {
        if (!catchBlock.id) {
          return;
        }
        if (!catchBlock.id.type) {
          this.emit(`if (__err instanceof ${CORE}.BaseError) {\n`, level + 1);
        } else {
          this.emit(`if (__err instanceof `, level + 1);
          this.visitType(catchBlock.id.type);
          this.emit(') {\n');
        }

        this.emit(`const ${_name(catchBlock.id)} = __err;\n`, level + 2);
        this.visitStmts(catchBlock.catchStmts, level + 2);
        this.emit('}\n', level + 1);
      });
      this.emit('}', level);
    } else if (ast.catchBlock && ast.catchBlock.stmts.length > 0) {
      this.emit(` catch (${_name(ast.catchId)}) {\n`);
      this.visitStmts(ast.catchBlock, level + 1);
      this.emit('}', level);
    }
    if (ast.finallyBlock && ast.finallyBlock.stmts.length > 0) {
      this.emit(' finally {\n');
      this.visitStmts(ast.finallyBlock, level + 1);
      this.emit('}', level);
    }
    this.emit('\n', level);
  }

  visitWhile(ast, level) {
    assert.equal(ast.type, 'while');
    this.emit('\n');
    this.emit('while (', level);
    this.visitExpr(ast.condition, level + 1);
    this.emit(') {\n');
    this.visitStmts(ast.stmts, level + 1);
    this.emit('}\n', level);
  }

  visitFor(ast, level) {
    assert.equal(ast.type, 'for');
    this.emit('\n');
    this.emit('for', level);
    if (ast.list.inferred.type === 'asyncIterator') {
      this.emit(' await ');
    }
    this.emit(`(let ${_name(ast.id)} of `);
    this.visitExpr(ast.list, level + 1);
    this.emit(') {\n');
    this.visitStmts(ast.stmts, level + 1);
    this.emit('}\n', level);
  }

  visitIf(ast, level) {
    assert.equal(ast.type, 'if');
    this.emit('if (', level);
    this.visitExpr(ast.condition, level + 1);
    this.emit(') {\n');
    this.visitStmts(ast.stmts, level + 1);
    this.emit('}', level);
    if (ast.elseIfs) {
      for (let i = 0; i < ast.elseIfs.length; i++) {
        const branch = ast.elseIfs[i];
        this.emit(' else if (');
        this.visitExpr(branch.condition, level + 1);
        this.emit(') {\n');
        this.visitStmts(branch.stmts, level + 1);
        this.emit('}', level);
      }
    }

    if (ast.elseStmts) {
      this.emit(' else {\n');
      for (let i = 0; i < ast.elseStmts.stmts.length; i++) {
        this.visitStmt(ast.elseStmts.stmts[i], level + 1);
      }
      if (ast.elseStmts.stmts.length === 0) {
        const comments = DSL.comment.getBetweenComments(this.comments, ast.elseStmts.tokenRange[0], ast.elseStmts.tokenRange[1]);
        this.visitComments(comments, level + 1);
      }
      this.emit('}', level);
    }

    this.emit('\n');
    this.emit('\n');
  }

  visitThrow(ast, level) {
    this.emit('throw ', level);
    if (ast.expr.type === 'construct_model') {
      this.visitConstructModel(ast.expr, level);
      this.emit(';\n');
    } else {
      this.emit(`${CORE}.newError(`);
      this.visitObject(ast.expr, level);
      this.emit(');\n');
    }
  }

  visitAssign(ast, level) {
    if (ast.left.type === 'property_assign' || ast.left.type === 'property') {
      this.emit(``, level);
      this.visitPropertyAccess(ast.left);
    } else if (ast.left.type === 'virtualVariable') { // vid
      this.emit(`this.${_vid(ast.left.vid)}`, level);
    } else if (ast.left.type === 'variable') {
      this.emit(`${_name(ast.left.id)}`, level);
    } else if (ast.left.type === 'map_access') {
      this.visitMapAccess(ast.left, level);
    } else if (ast.left.type === 'array_access') {
      this.visitArrayAccess(ast.left, level);
    } else {
      throw new Error('unimpelemented');
    }

    this.emit(' = ');
    if (ast.expr.needToReadable) {
      this.emit(`new ${CORE}.BytesReadable(`);
    }
    this.visitExpr(ast.expr, level);
    if (ast.expr.needToReadable) {
      this.emit(`)`);
    }
    this.emit(';\n');
  }

  visitDeclare(ast, level) {
    var id = _name(ast.id);
    this.emit(`let ${id}`, level);
    if (ast.expectedType && !this.isIterator(ast.expectedType)) {
      this.emit(` : `);
      this.visitType(ast.expectedType, level);
    }
    this.emit(` = `);
    this.visitExpr(ast.expr, level);
    this.emit(';\n');
  }

  visitStmts(ast, level) {
    assert.equal(ast.type, 'stmts');
    let node;
    for (var i = 0; i < ast.stmts.length; i++) {
      node = ast.stmts[i];
      this.visitStmt(node, level);
    }
    if (node) {
      //find the last node's back comment
      let comments = DSL.comment.getBackComments(this.comments, node.tokenRange[1]);
      this.visitComments(comments, level);
    }

    if (ast.stmts.length === 0) {
      //empty block's comment
      let comments = DSL.comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level);
    }
  }

  visitReturnBody(ast, level) {
    assert.equal(ast.type, 'returnBody');
    this.emit('\n');
    this.visitStmts(ast.stmts, level);
  }

  visitDefaultReturnBody(level) {
    this.emit('\n');
    this.emit('return {}\n', level);
  }

  visitFunctionBody(ast, level) {
    assert.equal(ast.type, 'functionBody');
    this.visitStmts(ast.stmts, level);
  }

  isIterator(returnType) {
    if (returnType.type === 'iterator' || returnType.type === 'asyncIterator') {
      return true;
    }
    return false;
  }

  eachFunction(ast, level) {
    this.visitAnnotation(ast.annotation, level);
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    const functionName = _name(ast.functionName);
    this.emit('', level);
    if (ast.isStatic) {
      this.emit('static ');
    }
    if (ast.isAsync) {
      this.emit('async ');
    }


    if (this.isIterator(ast.returnType)) {
      this.emit('*');
    }

    this.emit(`${functionName}`);

    this.visitParams(ast.params, level);
    this.visitReturnType(ast);
    this.emit('{\n');
    if (ast.functionBody) {
      this.visitFunctionBody(ast.functionBody, level + 1);
    } else {
      // interface mode
      this.emit(`throw new Error('Un-implemented!');\n`, level + 1);
    }
    this.emit('}\n', level);
  }

  eachAPI(ast, level) {
    // if (ast.annotation) {
    //   this.emit(`${_anno(ast.annotation.value)}\n`, level);
    // }
    this.visitAnnotation(ast.annotation, level);
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    const apiName = _name(ast.apiName);

    this.emit(`async ${this.isIterator(ast.returnType) ? '*' : ''}${apiName}`, level);
    this.visitParams(ast.params, level);
    this.visitReturnType(ast);
    this.emit('{\n');
    let baseLevel = ast.runtimeBody ? level + 2 : level;
    // api level
    if (ast.runtimeBody) {
      this.visitRuntimeBefore(ast.runtimeBody, level + 1);
    }

    // temp level
    this.visitAPIBody(ast.apiBody, baseLevel + 1);

    if (ast.runtimeBody) {
      this.emit(`_lastRequest = ${REQUEST};\n`, baseLevel + 1);
    }

    this.emit(`let ${RESPONSE} = await ${CORE}.doAction(${REQUEST}`, baseLevel + 1);

    if (ast.runtimeBody) {
      this.emit(', _runtime');
    }
    this.emit(');\n');

    if (ast.runtimeBody) {
      this.emit(`_lastResponse = ${RESPONSE};\n`, baseLevel + 1);
    }

    if (ast.returns) {
      this.visitReturnBody(ast.returns, baseLevel + 1);
    } else {
      this.visitDefaultReturnBody(baseLevel + 1);
    }

    if (ast.runtimeBody) {
      this.visitRuntimeAfter(ast.runtimeBody, level + 1);
    }

    this.emit('}\n', level);
  }

  visitRuntimeAfter(ast, level) {
    this.emit('} catch (ex) {\n', level + 1);
    this.emit(`_context = new ${CORE}.RetryPolicyContext({\n`, level + 2);
    this.emit('retriesAttempted : _retriesAttempted,\n', level + 3);
    this.emit('httpRequest : _lastRequest,\n', level + 3);
    this.emit('httpResponse : _lastResponse,\n', level + 3);
    this.emit('exception : ex,\n', level + 3);
    this.emit(`});\n`, level + 2);
    this.emit('continue;\n', level + 2);
    this.emit('}\n', level + 1);
    this.emit('}\n', level);
    this.emit('\n');
    this.emit(`throw ${CORE}.newUnretryableError(_context);\n`, level);
  }

  importBefore(level) {
    // Nothing
  }

  modelBefore() {
    _removeFilesInDirectory(path.join(this.outputDir, this.modelPath));
    _removeFilesInDirectory(path.join(this.outputDir, this.exceptionPath));
  }

  moduleBefore(ast) {
    if(!this.exportGen && Object.keys(this.exports).length > 0) {
      this.exportGen = true;
      Object.keys(this.exports).map(aliasId => {
        const tsPath = this.exports[aliasId].replace(/(\.tea)$|(\.spec)$|(\.dara)$/gi, '');
        ast.innerModule.set(aliasId, `${tsPath}.ts`);
        this.emit(`export * as $${aliasId} from '${tsPath}';\n`);
        this.emit(`export { default as ${aliasId} } from '${tsPath}';\n`);
      });
      this.emit(`\n`);
    }

    if(this.hasException) {
      this.emit(`import * as $_error from './${path.basename(this.exceptionPath)}/error';\n`);
      this.emit(`export * from './${path.basename(this.exceptionPath)}/error';\n`);
    }

    if(this.hasModel) {
      this.emit(`import * as $_model from './${path.basename(this.modelPath)}/model';\n`);
      this.emit(`export * from './${path.basename(this.modelPath)}/model';\n`);
    }

  }

  apiBefore(level) {
    this.emit(`\n`);
    this.emit(`export default class Client`, level);
    if (this.parentModule) {
      this.moudleUsed.push(this.parentModule.lexeme);
      this.emit(` extends ${this.parentModule.lexeme}`);
    }
    this.emit(` {\n`);
  }

  functionBefore() {
    this.emit(`\n`);
  }

  moduleAfter() {
    this.emit(`
}
`);
  }

}

module.exports = Visitor;
