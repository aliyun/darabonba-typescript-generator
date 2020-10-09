'use strict';

const path = require('path');
const fs = require('fs');
const util = require('util');
const readdirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);
const assert = require('assert');

const { Package } = require('@darabonba/parser');
const Generator = require('../lib/generator');

async function codegen(pkgDir, outputDir) {
  const pkg = new Package(path.resolve(pkgDir));
  await pkg.analyse();

  const generator = new Generator({
    outputDir
  }, pkg);
  await generator.visit();
}

async function compare(outputDir, expectedDir) {
  const files = await readdirAsync(outputDir, {
    withFileTypes: true
  });
  for (let i = 0; i < files.length; i++) {
    const dirent = files[i];
    if (dirent.isFile()) {
      const filePath = path.join(expectedDir, dirent.name);
      const expected = await readFileAsync(filePath, 'utf8');
      const actual = await readFileAsync(path.join(outputDir, dirent.name), 'utf8');
      assert.deepStrictEqual(actual, expected);
    } else if (dirent.isDirectory()) {
      await compare(path.join(outputDir, dirent.name), path.join(expectedDir, dirent.name));
    }
  }
}

async function check(pkgDir, outputDir, expectedDir) {
  await codegen(pkgDir, outputDir);
  await compare(outputDir, expectedDir);
}

describe('new Generator', function() {
  before(function () {
    fs.rmdirSync(path.join(__dirname, 'output'), {
      recursive: true
    });
  });

  it('must pass in outputDir', function () {
    assert.throws(function () {
      new Generator({});
    }, function(err) {
      assert.deepStrictEqual(err.message, '`config.outputDir` should not empty');
      return true;
    });
  });

  it('empty module should ok', async function () {
    const outputDir = path.join(__dirname, 'output/empty');
    const pkgDir = path.join(__dirname, 'fixtures/empty');
    const expectedDir = path.join(__dirname, 'fixtures/empty/expected');
    await check(pkgDir, outputDir, expectedDir);
  });

  it('model should ok', async function () {
    const outputDir = path.join(__dirname, 'output/model');
    const pkgDir = path.join(__dirname, 'fixtures/model');
    const expectedDir = path.join(__dirname, 'fixtures/model/expected');
    await check(pkgDir, outputDir, expectedDir);
  });

  it('interface should ok', async function () {
    const outputDir = path.join(__dirname, 'output/interface');
    const pkgDir = path.join(__dirname, 'fixtures/interface');
    const expectedDir = path.join(__dirname, 'fixtures/interface/expected');
    await check(pkgDir, outputDir, expectedDir);
  });

  it('module should ok', async function () {
    const outputDir = path.join(__dirname, 'output/module');
    const pkgDir = path.join(__dirname, 'fixtures/module');
    const expectedDir = path.join(__dirname, 'fixtures/module/expected');
    await check(pkgDir, outputDir, expectedDir);
  });

  it('module without binding should ok', async function () {
    const outputDir = path.join(__dirname, 'output/module_no_binding');
    const pkgDir = path.join(__dirname, 'fixtures/module_no_binding');
    try {
      await codegen(pkgDir, outputDir);
    } catch (ex) {
      assert.strictEqual(ex.message, 'the binding for Module/bindingMethod is undefined');
      return;
    }
    assert.fail();
  });

  it('package without ts releases should ok', async function () {
    const outputDir = path.join(__dirname, 'output/package_no_ts');
    const pkgDir = path.join(__dirname, 'fixtures/package_no_ts');
    try {
      await codegen(pkgDir, outputDir);
    } catch (ex) {
      assert.strictEqual(ex.message, `The '$source' has no TypeScript supported.`);
      return;
    }
    assert.fail();
  });

  it('extern package should ok', async function () {
    const outputDir = path.join(__dirname, 'output/package_with_dependencies');
    const pkgDir = path.join(__dirname, 'fixtures/package_with_dependencies');
    const expectedDir = path.join(__dirname, 'fixtures/package_with_dependencies/expected');
    await check(pkgDir, outputDir, expectedDir);
  });
});
