'use strict';

const assert = require('assert');

const path = require('path');
const fs = require('fs');

const DSL = require('@darabonba/parser');
const {
  _name, _string, _type, _subModelName, _vid,
  REQUEST, RESPONSE, CORE
} = require('./helper');
const { Tag } = require('@darabonba/parser/lib/tag');

function avoidReserveName(name) {
  const reserves = [
    'function'
  ];

  if (reserves.indexOf(name) !== -1) {
    return `_${name}`;
  }

  return name;
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
        '@alicloud/tea-typescript': '^1.7.1'
      };
    }
    if (!this.package.files) {
      this.package.files = [
        'dist',
        'src'
      ];
    }
  }

  save(filepath) {
    const targetPath = path.join(this.outputDir, filepath);
    const packagePath = path.join(this.outputDir, 'package.json');
    fs.mkdirSync(path.dirname(targetPath), {
      recursive: true
    });

    fs.writeFileSync(targetPath, this.output);
    fs.writeFileSync(packagePath, JSON.stringify(this.package, null, 2));
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
    this.visitModule(ast, level);
  }

  visitModule(ast, level) {
    assert.equal(ast.type, 'module');
    this.predefined = ast.models;
    this.parentModule = ast.extends;
    this.comments = ast.comments;
    this.importBefore(level);

    this.visitAnnotation(ast.annotation, level);

    this.eachImport(ast.imports, ast.usedExternModel, level);

    this.moduleBefore(ast);

    const models = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'model';
    });

    for (let i = 0; i < models.length; i++) {
      this.eachModel(models[i], level);
    }

    const subModels = Object.keys(this.predefined).filter((key) => {
      return !key.startsWith('$') && this.predefined[key].type === 'model' && key.indexOf('.') !== -1;
    }).map((key) => {
      return this.predefined[key];
    });

    for (let i = 0; i < subModels.length; i++) {
      this.eachSubModel(subModels[i], level);
    }

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
    this.save(this.config.clientPath);
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
    annotation.value.split('\n').forEach((line) => {
      this.emit(`${line}`, level);
      this.emit(`\n`);
    });
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

  eachImport(imports, usedModels, level) {
    this.imports = new Map();
    if (imports.length > 0) {
      const lockPath = path.join(this.config.pkgDir, '.libraries.json');
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
      for (let i = 0; i < imports.length; i++) {
        const item = imports[i];
        let comments = DSL.comment.getFrontComments(this.comments, item.tokenRange[0]);
        this.visitComments(comments, level);
        const aliasId = item.lexeme;
        const moduleDir = this.config.libraries[aliasId];
        // when test.ts import own client.ts
        if (!moduleDir) {
          this.emit(`import ${aliasId}`, level);
          const models = [...usedModels.get(aliasId)];
          if (models.length > 0) {
            this.emit(`, * as $${aliasId}`, level);
          }
          this.emit(` from '../src/client';\n`);
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
        this.emit(`import ${aliasId}`, level);
        this.imports.set(aliasId, pkgName);
        // set to array
        const models = [...usedModels.get(aliasId)];
        if (models.length > 0) {
          this.emit(`, * as $${aliasId}`, level);
        }
        this.emit(` from '${pkgName}';\n`);
      }
      this.__externModule = usedModels;
    }
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

  visitType(ast, level) {
    if (ast.type === 'array') {
      this.visitType(ast.subType, level);
      this.emit(`[]`);
    } else if (ast.type === 'moduleModel') {
      const [moduleId, ...rest] = ast.path;
      this.emit(`$${moduleId.lexeme}.`);
      this.emit(_subModelName(rest.map((item) => {
        return item.lexeme;
      }).join('.')));
    } else if (ast.type === 'subModel') {
      const [moduleId, ...rest] = ast.path;
      this.emit(_subModelName([moduleId.lexeme, ...rest.map((item) => {
        return item.lexeme;
      })].join('.')));
    } else if (ast.type === 'map') {
      this.emit(`{[key: `);
      this.visitType(ast.keyType, level);
      this.emit(` ]: `);
      this.visitType(ast.valueType, level);
      this.emit(`}`);
    } else if (ast.type === 'model') {
      if (ast.moduleName) {
        this.emit(`$${ast.moduleName}.`);
      }
      this.emit(`${ast.name}`);
    } else {
      this.emit(_type(_name(ast)));
    }
  }

  visitReturnType(ast, level) {
    this.emit(`: `);
    if (ast.isAsync) {
      this.emit(`Promise<`);
    }
    this.visitType(ast.returnType, level);
    if (ast.isAsync) {
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
    this.emit('let _lastRequest = null;\n', level);
    this.emit('let _now = Date.now();\n', level);
    this.emit('let _retryTimes = 0;\n', level);
    this.emit(`while (${CORE}.allowRetry(_runtime['retry'], _retryTimes, _now)) {\n`, level);
    this.emit('if (_retryTimes > 0) {\n', level + 1);
    this.emit(`let _backoffTime = ${CORE}.getBackoffTime(_runtime['backoff'], _retryTimes);\n`, level + 2);
    this.emit('if (_backoffTime > 0) {\n', level + 2);
    this.emit(`await ${CORE}.sleep(_backoffTime);\n`, level + 3);
    this.emit('}\n', level + 2);
    this.emit('}\n', level + 1);
    this.emit('\n');
    this.emit('_retryTimes = _retryTimes + 1;\n', level + 1);
    this.emit('try {\n', level + 1);
  }

  visitStmt(ast, level) {
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    if (ast.type === 'return') {
      this.visitReturn(ast, level);
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
      this.emit(`${_subModelName([modelName, fieldName].join('.'))}`);
    }  else if (value.type === 'array') {
      this.visitType(value);
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
      this.emit(`${_type(value.lexeme)}`);
    } else if (value.tag === Tag.ID) {
      this.emit(`${value.lexeme}`);
    } else if (value.type === 'moduleModel') {
      const [moduleId, ...models] = value.path;
      this.emit(`$${moduleId.lexeme}.${_subModelName(models.map((item) => item.lexeme).join('.'))}`);
    } else if (value.type === 'subModel') {
      const [moduleId, ...rest] = value.path;
      this.emit(_subModelName([moduleId.lexeme, ...rest.map((item) => {
        return item.lexeme;
      })].join('.')));
    } else if (typeof value.fieldType === 'string') {
      this.emit(`${_type(value.fieldType)}`);
    } else if (value.fieldType.type === 'moduleModel') {
      const [moduleId, ...models] = value.fieldType.path;
      this.emit(`$${moduleId.lexeme}.${_subModelName(models.map((item) => item.lexeme).join('.'))}`);
    } else if (value.fieldType.type) {
      this.emit(`${_type(value.fieldType.lexeme)}`);
    } else if (value.fieldType.idType === 'model') {
      this.emit(`${_type(value.fieldType.lexeme)}`);
    } else if (value.fieldType.idType === 'module') {
      this.emit(`${_type(value.fieldType.lexeme)}`);
    } else if (value.fieldType.idType === 'builtin_model') {
      this.emit(`${_type(value.fieldType.lexeme)}`);
    }
  }

  visitFieldTypeString(value, level, modelName, fieldName) {
    if (value.type === 'modelBody') {
      this.emit(_subModelName([modelName, fieldName].join('.')));
    }  else if (value.type === 'array') {
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
      this.emit(`$${moduleId.lexeme}.${_subModelName(models.map((item) => item.lexeme).join('.'))}`);
    } else if (value.type === 'subModel') {
      const [moduleId, ...rest] = value.path;
      this.emit(_subModelName([moduleId.lexeme, ...rest.map((item) => {
        return item.lexeme;
      })].join('.')));
    } else if (typeof value.fieldType === 'string') {
      this.emit(`'${_type(value.fieldType)}'`);
    } else if (value.fieldType.type === 'moduleModel') {
      const [moduleId, ...models] = value.fieldType.path;
      this.emit(`$${moduleId.lexeme}.${_subModelName(models.map((item) => item.lexeme).join('.'))}`);
    } else if (value.fieldType.type) {
      this.emit(`${_type(value.fieldType.lexeme)}`);
    } else if (value.fieldType.idType === 'model') {
      this.emit(`${_type(value.fieldType.lexeme)}`);
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
      this.visitComments(comments, level);
      this.emit(`${_name(node.fieldName)}${node.required ? '' : '?'}: `, level);
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
        this.emit(`${_name(node.fieldName)}: '${_string(nameAttr.attrValue)}',\n`, level + 2);
      } else {
        this.emit(`${_name(node.fieldName)}: '${_name(node.fieldName)}',\n`, level + 2);
      }
    }
    this.emit(`};\n`, level + 1);
    this.emit(`}\n`, level);

    this.emit('\n');
    this.emit(`static types(): { [key: string]: any } {\n`, level);
    this.emit(`return {\n`, level + 1);
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      this.emit(`${_name(node.fieldName)}: `, level + 2);
      this.visitFieldTypeString(node.fieldValue, level + 2, modelName, _name(node.fieldName));
      this.emit(',\n');
    }
    this.emit(`};\n`, level + 1);
    this.emit(`}\n`, level);
  }

  visitModel(modelBody, modelName, level) {
    this.emit(`export class ${modelName} extends ${CORE}.Model {\n`, level);
    this.visitModelBody(modelBody, level + 1, modelName);
    this.emit(`\n`);
    this.emit(`constructor(map?: { [key: string]: any }) {\n`, level + 1);
    this.emit(`super(map);\n`, level + 2);
    this.emit(`}\n`, level + 1);
    this.emit('}\n\n', level);
  }

  eachModel(ast, level) {
    assert.equal(ast.type, 'model');
    const modelName = _name(ast.modelName);
    this.visitAnnotation(ast.annotation, level);
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    this.visitModel(ast.modelBody, modelName, level);
  }

  eachSubModel(ast, level) {
    assert.equal(ast.type, 'model');
    const modelName = _subModelName(_name(ast.modelName));
    this.visitModel(ast.modelBody, modelName, level);
  }

  visitObjectFieldValue(ast, level) {
    this.visitExpr(ast, level);
  }

  visitObjectField(ast, level) {
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    if (ast.type === 'objectField') {
      var key = _name(ast.fieldName);
      if (key.indexOf('-') !== -1) {
        key = `'${key}'`;
      }
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
    if (ast.isStatic) {
      this.emit(`Client.${_name(ast.left.id)}`);
    } else {
      this.emit(`this.${_name(ast.left.id)}`);
    }
    this.visitArgs(ast.args, level);
  }

  visitInstanceCall(ast, level) {
    assert.equal(ast.left.type, 'instance_call');
    const method = ast.left.propertyPath[0];
    if (ast.isAsync) {
      this.emit(`await `);
    }
    if (ast.left.id.tag === DSL.Tag.Tag.VID) {
      this.emit(`this.${_vid(ast.left.id)}`);
    } else {
      this.emit(`${_name(ast.left.id)}`);
    }
    this.emit(`.${_name(method)}`);
    this.visitArgs(ast.args, level);
  }

  visitStaticCall(ast, level) {
    assert.equal(ast.left.type, 'static_call');
    if (ast.isAsync) {
      this.emit(`await `);
    }
    this.emit(`${_name(ast.left.id)}.${_name(ast.left.propertyPath[0])}`);
    this.visitArgs(ast.args, level);
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
      throw new Error('un-implemented');
    }
  }

  visitConstruct(ast, level) {
    assert.equal(ast.type, 'construct');
    this.emit('new ');
    this.emit(`${ast.aliasId.lexeme}`);
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
        this.emit('$tea.toMap(');
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
      this.emit(avoidReserveName(_name(ast.id)));
    } else if (ast.type === 'virtualVariable') {
      this.emit(`this.${_vid(ast.vid)}`);
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
    } else if (ast.type === 'and') {
      this.visitExpr(ast.left, level);
      this.emit(' && ');
      this.visitExpr(ast.right, level);
    } else if (ast.type === 'or') {
      this.visitExpr(ast.left, level);
      this.emit(' || ');
      this.visitExpr(ast.right, level);
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
      this.emit(`new $${moduleName}.`);
      this.emit(_subModelName(ast.propertyPath.map((item) => {
        return item.lexeme;
      }).join('.')));
    }

    if (ast.aliasId.isModel) {
      let mainModelName = ast.aliasId.lexeme;
      this.emit(`new `);
      this.emit(_subModelName([mainModelName, ...ast.propertyPath.map((item) => {
        return item.lexeme;
      })].join('.')));
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
    this.emit(`${expr}[`, level)
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
    this.emit(`${expr}[`, level)
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
    this.emit(`throw $tea.newRetryError(${REQUEST}, ${RESPONSE});\n`, level);
  }

  visitTry(ast, level) {
    assert.equal(ast.type, 'try');
    this.emit('try {\n', level);
    this.visitStmts(ast.tryBlock, level + 1);
    this.emit('}', level);
    if (ast.catchBlock && ast.catchBlock.stmts.length > 0) {
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
    this.emit(`for (let ${_name(ast.id)} of `, level);
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
    this.emit(`throw ${CORE}.newError(`, level);
    this.visitObject(ast.expr, level);
    this.emit(');\n');
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
      this.visitMapAccess(ast.left, level)
    } else if (ast.left.type === 'array_access') {
      this.visitArrayAccess(ast.left, level)
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
    if (ast.expectedType) {
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
    this.emit(`async ${apiName}`, level);
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
    this.emit(`if (${CORE}.isRetryable(ex)) {\n`, level + 2);
    this.emit('continue;\n', level + 3);
    this.emit('}\n', level + 2);
    this.emit('throw ex;\n', level + 2);
    this.emit('}\n', level + 1);
    this.emit('}\n', level);
    this.emit('\n');
    this.emit(`throw ${CORE}.newUnretryableError(_lastRequest);\n`, level);
  }

  importBefore(level) {
    this.emit(`// This file is auto-generated, don't edit it\n`, level);
  }

  moduleBefore(ast) {
    if (ast.usedTypes.has('readable')) {
      this.emit(`import { Readable } from 'stream';\n`);
    }
    this.emit(`import * as $tea from '@alicloud/tea-typescript';\n`);
    this.emit(`\n`);
  }

  apiBefore(level) {
    this.emit(`\n`);
    this.emit(`export default class Client`, level);
    if (this.parentModule) {
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
