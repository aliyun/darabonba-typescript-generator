'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');

const DSL = require('@darabonba/parser');

let Generator = require('../lib/generator');

function check(mainFilePath, outputDir, expectedPath, pkgInfo = {}) {
  const generator = new Generator({
    outputDir,
    ...pkgInfo
  });

  const dsl = fs.readFileSync(mainFilePath, 'utf8');
  const ast = DSL.parse(dsl, mainFilePath);
  generator.visit(ast);
  const clientPath = path.join(outputDir, 'src/client.ts');
  const expected = fs.readFileSync(expectedPath, 'utf8');
  assert.deepStrictEqual(fs.readFileSync(clientPath, 'utf8'), expected);
}

describe('new Generator', function() {
  it('must pass in outputDir', function () {
    assert.throws(function () {
      new Generator({});
    }, function(err) {
      assert.deepStrictEqual(err.message, '`option.outputDir` should not empty');
      return true;
    });
  });

  it('empty module should ok', function () {
    const outputDir = path.join(__dirname, 'output/empty');
    const mainFilePath = path.join(__dirname, 'fixtures/empty/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/empty/client.ts'));
  });

  it('one model should ok', function () {
    const outputDir = path.join(__dirname, 'output/model');
    const mainFilePath = path.join(__dirname, 'fixtures/model/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/model/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/model/client.ts'), {
      pkgDir: path.join(__dirname, 'fixtures/model'),
      ...pkg
    });
  });

  it('one api should ok', function () {
    const outputDir = path.join(__dirname, 'output/api');
    const mainFilePath = path.join(__dirname, 'fixtures/api/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/api/client.ts'));
  });

  it('one function should ok', function () {
    const outputDir = path.join(__dirname, 'output/function');
    const mainFilePath = path.join(__dirname, 'fixtures/function/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/function/client.ts'));
  });

  it('const should ok', function () {
    const outputDir = path.join(__dirname, 'output/const');
    const mainFilePath = path.join(__dirname, 'fixtures/const/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/const/client.ts'));
  });

  it('statements should ok', function () {
    const outputDir = path.join(__dirname, 'output/statements');
    const mainFilePath = path.join(__dirname, 'fixtures/statements/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/statements/client.ts'));
  });

  it('import should ok', function () {
    const outputDir = path.join(__dirname, 'output/import');
    const mainFilePath = path.join(__dirname, 'fixtures/import/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/import/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/import/client.ts'), {
      pkgDir: path.join(__dirname, 'fixtures/import'),
      ...pkg
    });
  });

  it('complex should ok', function () {
    const outputDir = path.join(__dirname, 'output/complex');
    const mainFilePath = path.join(__dirname, 'fixtures/complex/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/complex/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/complex/client.ts'), {
      pkgDir: path.join(__dirname, 'fixtures/complex'),
      ...pkg
    });
  });

  it('add annotation should ok', function () {
    const outputDir = path.join(__dirname, 'output/annotation');
    const mainFilePath = path.join(__dirname, 'fixtures/annotation/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/annotation/client.ts'), {editable: true});
  });

  it('add comments should ok', function () {
    const outputDir = path.join(__dirname, 'output/comment');
    const mainFilePath = path.join(__dirname, 'fixtures/comment/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/comment/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/comment/client.ts'), {
      pkgDir: path.join(__dirname, 'fixtures/comment'),
      ...pkg,
      editable: 'true'
    });
  });

  it('add builtin should ok', function () {
    const outputDir = path.join(__dirname, 'output/builtin');
    const mainFilePath = path.join(__dirname, 'fixtures/builtin/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/builtin/client.ts'), {editable: 1});
  });

  it('multi dara should ok', function () {
    const outputDir = path.join(__dirname, 'output/multi');
    const mainFilePath = path.join(__dirname, 'fixtures/multi/tea/sdk.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/multi/tea/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    const generator = new Generator({
      outputDir,
      pkgDir: path.join(__dirname, 'fixtures/multi/tea'),
      ...pkg,
      editable: 'test-other'
    });
  
    const dsl = fs.readFileSync(mainFilePath, 'utf8');
    const ast = DSL.parse(dsl, mainFilePath);
    generator.visit(ast);
    const mainPath = path.join(outputDir, 'src/client.ts');
    const apiPath = path.join(outputDir, 'src/api.ts');
    const modelPath = path.join(outputDir, 'src/model/user.ts');
    const utilPath = path.join(outputDir, 'src/lib/util.ts');
    const expectedMainPath = path.join(__dirname, 'fixtures/multi/sdk/client.ts');
    const expectedModelPath = path.join(__dirname, 'fixtures/multi/sdk/user.ts');
    const expectedUtilPath = path.join(__dirname, 'fixtures/multi/sdk/util.ts');
    const expectedApiPath = path.join(__dirname, 'fixtures/multi/sdk/api.ts');
    const expectedMain = fs.readFileSync(expectedMainPath, 'utf8');
    assert.deepStrictEqual(fs.readFileSync(mainPath, 'utf8'), expectedMain);
    const expectedModel = fs.readFileSync(expectedModelPath, 'utf8');
    assert.deepStrictEqual(fs.readFileSync(modelPath, 'utf8'), expectedModel);
    const expectedUtil = fs.readFileSync(expectedUtilPath, 'utf8');
    assert.deepStrictEqual(fs.readFileSync(utilPath, 'utf8'), expectedUtil);
    const expectedApi = fs.readFileSync(expectedApiPath, 'utf8');
    assert.deepStrictEqual(fs.readFileSync(apiPath, 'utf8'), expectedApi);
  });

  it('tea should ok', function () {
    const outputDir = path.join(__dirname, 'output/tea');
    const mainFilePath = path.join(__dirname, 'fixtures/tea/main.tea');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/tea/Teafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'fixtures/tea/client.ts'), {
      pkgDir: path.join(__dirname, 'fixtures/tea'),
      ...pkg,
      editable: false
    });
  });
});
