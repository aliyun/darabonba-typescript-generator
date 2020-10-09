'use strict';

const path = require('path');
const fs = require('fs').promises;
const exists = require('util').promisify(require('fs').exists);

const Model = require('./model');
const Module = require('./module');
const Interface = require('./interface');
const Emitter = require('./emitter');

class Generator {
  constructor(config, pkg) {
    this.config = config;
    this.pkg = pkg;
    if (!this.config.outputDir) {
      throw new Error('`config.outputDir` should not empty');
    }
  }

  async visit() {
    let bindingMapping = {};
    const bindingPath = path.join(this.pkg.pkgDir, 'binding.ts.js');
    if (await exists(bindingPath)) {
      bindingMapping = require(bindingPath);
    }
    for (const [name, item] of this.pkg.components) {
      if (item.type === 'model') {
        const model = new Model(item, {
          config: this.config,
          pkg: this.pkg
        });
        model.visit();
        await model.save();
      } else if (item.type === 'module') {
        const module = new Module(item, {
          config:this.config,
          pkg: this.pkg,
          binding: bindingMapping[name] || { methods: {} }
        });
        module.visit();
        await module.save();
      } else if (item.type === 'interface') {
        const interface_ = new Interface(item, {
          config:this.config,
          pkg: this.pkg
        });
        interface_.visit();
        await interface_.save();
      }
    }

    // tsconfig.json
    await this.saveTsConfig();
    // package.json
    await this.savePackage();
    // index.ts
    await this.saveIndexTs();
  }

  async saveIndexTs() {
    let index = new Emitter({
      filename: path.join(this.config.outputDir, 'src', `index.ts`)
    });

    index.emit('// models\n');
    for (const [name, item] of this.pkg.components) {
      if (item.type === 'model') {
        const filename = path.basename(item.ctx.filename, '.dara');
        index.emit(`export { ${name} } from './${filename}';\n`);
      }
    }
    index.emit('\n');
    index.emit('// interfaces\n');
    for (const [name, item] of this.pkg.components) {
      if (item.type === 'interface') {
        const filename = path.basename(item.ctx.filename, '.dara');
        index.emit(`export { ${name} } from './${filename}';\n`);
      }
    }

    index.emit('\n');
    index.emit('// modules\n');
    for (const [name, item] of this.pkg.components) {
      if (item.type === 'module') {
        const filename = path.basename(item.ctx.filename, '.dara');
        index.emit(`export { ${name} } from './${filename}';\n`);
      }
    }

    await index.save();
  }

  async savePackage() {
    let pkg = {};
    const packagePath = path.join(this.config.outputDir, 'package.json');
    if (await exists(packagePath)) {
      try {
        const content = await fs.readFile(packagePath, 'utf8');
        pkg = JSON.parse(content);
      } catch (err) {
        throw new Error('invalid package.json');
      }
    }

    pkg.name = pkg.name || '';
    pkg.version = pkg.version || '1.0.0';
    pkg.description = pkg.description || '';
    pkg.main = pkg.main || 'dist/index.js';

    if (!pkg.scripts) {
      pkg.scripts = {
        test: 'mocha --reporter spec --timeout 3000 test/*.test.js',
        'test-cov': 'nyc -e .ts -r=html -r=text -r=lcov npm run test',
        build: 'tsc',
        prepublishOnly: 'tsc'
      };
    }

    pkg.author = pkg.author || '';
    pkg.license = pkg.license || 'ISC';
    if (!pkg.devDependencies) {
      pkg.devDependencies = {
        '@types/node': '^14',
        nyc: '^15',
        'source-map-support': '^0.5.16',
        'ts-node': '^9',
        typescript: '^4'
      };
    }
    if (!pkg.dependencies) {
      pkg.dependencies = {
        '@darabonba/typescript': '^1'
      };
    }
    if (!pkg.files) {
      pkg.files = [
        'dist',
        'src'
      ];
    }

    await this.save(packagePath, JSON.stringify(pkg, null, 2));
  }

  async saveTsConfig() {
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
    const tsconfigPath = path.join(this.config.outputDir, 'tsconfig.json');
    await this.save(tsconfigPath, JSON.stringify(config, null, 2));
  }

  async save(filename, content) {
    await fs.mkdir(path.dirname(filename), {
      recursive: true
    });
    await fs.writeFile(filename, content);
  }
}

module.exports = Generator;
