'use strict';

const assert = require('assert');
const path = require('path');

const { Tag, comment } = require('@darabonba/parser');

const Emitter = require('./emitter');
const { upperFirst } = require('./helper');

const CORE = '$dara';

function get(attrs, key, defaultValue) {
  for (let index = 0; index < attrs.length; index++) {
    const item = attrs[index];
    if (item.attrName.lexeme === key) {
      return `${item.attrValue.string}`;
    }
  }

  return defaultValue;
}

class Model extends Emitter {
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
    this.emitModel(this.ast, 0);
  }

  emitModel(ast, level) {
    this.emitImports(ast, level);
    this.emit(`export class ${this.name} extends ${CORE}.Model {\n`, level);
    this.emitFields(ast.modelBody, level + 1);
    this.emitToMap(ast.modelBody, level + 1);
    this.emitFromMap(ast.modelBody, level + 1);
    this.emitSetMethods(ast.modelBody, level + 1);
    this.emit('}\n', level);
  }

  emitSetMethods(ast, level) {
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      const name = node.fieldName.lexeme;
      this.emit(`\n`);
      this.emit(`set${upperFirst(name)}(value: `, level);
      this.emitType(node.fieldType, level);
      this.emit(`): ${this.name} {\n`);
      this.emit(`this.${name} = value;\n`, level + 1);
      this.emit(`return this;\n`, level + 1);
      this.emit('}\n', level);
    }
  }

  emitToMap(ast, level) {
    this.emit(`\n`);
    this.emit(`toMap(): {[key: string]: any} {\n`, level);
    this.emit(`let map: {[key: string]: any} = {};\n`, level + 1);
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      const name = node.fieldName.lexeme;
      const nameInMap = get(node.attrs, 'name', name);
      this.emit(`${CORE}.setToMap(map, '${nameInMap}', ${CORE}.mapify(this.${name}));\n`, level + 1);
    }
    this.emit(`return map;\n`, level + 1);
    this.emit(`}\n`, level);
  }

  emitFromMap(ast, level) {
    this.emit(`\n`);
    this.emit(`static from(map: {[key: string]: any}): ${this.name} {\n`, level);
    this.emit(`let model = new ${this.name}();\n`, level + 1);
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      const name = node.fieldName.lexeme;
      const nameInMap = get(node.attrs, 'name', name);

      this.emit(`if (!${CORE}.isUnset(map['${nameInMap}'])) {\n`, level + 1);
      if (node.fieldType.tag === Tag.TYPE) {
        this.emit(`model.${name} = map['${nameInMap}'];\n`, level + 2);
      }
      // TODO: model, map, array
      this.emit(`}\n`, level + 1);
    }
    this.emit(`return model;\n`, level + 1);
    this.emit(`}\n`, level);
  }

  emitFields(ast, level) {
    assert.equal(ast.type, 'modelBody');
    let node;
    for (let i = 0; i < ast.nodes.length; i++) {
      node = ast.nodes[i];
      const name = node.fieldName.lexeme;
      let comments = comment.getFrontComments(this.comments, node.tokenRange[0]);
      this.emitComments(comments, level);
      this.emit(`${name}${node.required ? '' : '?'}: `, level);
      this.emitType(node.fieldType, level);
      this.emit(';\n');
    }

    if (node) {
      //find the last node's back comment
      let comments = comment.getBetweenComments(this.comments, node.tokenRange[0], ast.tokenRange[1]);
      this.emitComments(comments, level);
    }

    if (ast.nodes.length === 0) {
      //empty block's comment
      let comments = comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
      this.emitComments(comments, level);
    }
  }
}

Object.assign(Model.prototype, require('./traits'));

module.exports = Model;
