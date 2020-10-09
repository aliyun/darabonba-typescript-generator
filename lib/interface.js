'use strict';

const path = require('path');
const assert = require('assert');

const { comment } = require('@darabonba/parser');

const { _name } = require('./helper');

const Emitter = require('./emitter');

class Interface extends Emitter {
  constructor(item, ctx) {
    const filename = path.basename(item.ctx.filename, '.dara');
    super({
      filename: path.join(ctx.config.outputDir, 'src', `${filename}.ts`)
    });
    this.ast = item.ast;
    this.comments = item.ast.comments;
    this.name = item.ast.name.lexeme;
    this.analyser = item.analyser;
    this.ctx = ctx;
  }

  visit() {
    this.emitInterface(this.ast, 0);
  }

  emitInterface(ast, level) {
    this.emit(`// This file is auto-generated, don't edit it\n`, level);
    this.emit(`\n`);
    this.emitImports(ast, level);
    this.emit(`export interface ${this.name} {\n`, level);
    this.emit('\n');
    ast.interfaceBody.nodes.forEach((item) => {
      assert.strictEqual(item.type, 'function');
      this.emitFunction(item, level + 1);
    });
    this.emit(`}\n`);
  }

  emitFunction(ast, level) {
    this.emitAnnotation(ast.annotation, level);
    let comments = comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.emitComments(comments, level);
    const functionName = _name(ast.functionName);
    this.emit(`${functionName}`, level);
    this.emitParams(ast.params, level);
    this.emitReturnType(ast);
    this.emit(';\n');
    this.emit(`\n`);
  }
}

Object.assign(Interface.prototype, require('./traits'));

module.exports = Interface;
