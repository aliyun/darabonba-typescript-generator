English | [简体中文](/README-CN.md)

# Darabonba Code Generator for Typescript

[![NPM version][npm-image]][npm-url]
[![CI](https://github.com/aliyun/darabonba-typescript-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/aliyun/darabonba-typescript-generator/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/aliyun/darabonba-typescript-generator/graph/badge.svg?token=t97XcVkcDB)](https://codecov.io/gh/aliyun/darabonba-typescript-generator)
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@darabonba/typescript-generator.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@darabonba/typescript-generator
[download-image]: https://img.shields.io/npm/dm/@darabonba/typescript-generator.svg?style=flat-square
[download-url]: https://npmjs.org/package/@darabonba/typescript-generator

## Installation

Darabonba Code Generator was designed to work in Node.js. The preferred way to install the Generator is to use the [NPM](https://www.npmjs.com/) package manager. Simply type the following into a terminal window:

```shell
npm install @darabonba/typescript-generator
```

## Usage

```js
"use strict";

const path = require("path");
const fs = require("fs");

const parser = require("@darabonba/parser");
const generator = require("@darabonba/typescript-generator");

const sourceDir = "<Darabonda package directory>";
const outputDir = "<Generate output directory>";

// generate AST data by parser
let packageMetaFilePath = path.join(sourceDir, "Darafile");
let packageMeta = JSON.parse(fs.readFileSync(packageMetaFilePath, "utf8"));
let mainFile = path.join(sourceDir, packageMeta.main);
let ast = parser.parse(fs.readFileSync(mainFile, "utf8"), mainFile);

// initialize generator
let generatorConfig = {
  ...packageMeta,
  pkgDir: sourceDir,
  outputDir,
};
let generator = new generator(generatorConfig);

// generate typescript code by generator
generator.visit(ast);

// The execution result will be output in the 'outputDir'
```

## Issues

[Opening an Issue](https://github.com/aliyun/darabonba-typescript-generator/issues/new/choose), Issues not conforming to the guidelines may be closed immediately.

## Changelog

Detailed changes for each release are documented in the [release notes](/CHANGELOG.md).

## License

[Apache-2.0](/LICENSE)
Copyright (c) 2009-present, Alibaba Cloud All rights reserved.
