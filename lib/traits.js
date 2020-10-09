'use strict';

const path = require('path');
const assert = require('assert');

const { Tag, comment } = require('@darabonba/parser');

const {
  avoidReserveName,
  _type
} = require('./helper');

const traits = {
  emitType: function (type, level) {
    if (type.tag === Tag.TYPE) {
      this.emit(`${_type(type.lexeme)}`);
    } else if (type.tag === Tag.ID) {
      this.emit(`${type.lexeme}`);
    } else if (type.type === 'map') {
      this.emit(`{[key: `);
      this.emitType(type.keyType);
      this.emit(`]: `);
      this.emitType(type.valueType);
      this.emit(`}`);
    } else if (type.type === 'array') {
      this.emitType(type.itemType);
      this.emit(`[]`);
    } else if (type.type === 'extern_component') {
      this.emit(`${type.aliasId.lexeme}.${type.component.lexeme}`);
    } else {
      console.log(type);
      throw new Error('un-implemented');
    }
  },

  emitAnnotation: function(annotation, level) {
    if (!annotation || !annotation.value) {
      return;
    }
    let comments = comment.getFrontComments(this.comments, annotation.index);
    this.emitComments(comments, level);
    annotation.value.split('\n').forEach((line) => {
      const trimed = line.trim();
      if (trimed.startsWith('/**')) {
        this.emit(`${trimed}\n`, level);
      } else {
        this.emit(` ${trimed}\n`, level);
      }
    });
  },

  emitComments: function(comments, level) {
    comments.forEach(comment => {
      this.emit(`${comment.value}\n`, level);
    });
  },

  emitImports: function (ast, level) {
    if (this.analyser.usedFeatures.get('throw') || this.analyser.usedFeatures.get('defined_model')) {
      this.emit(`import * as $dara from '@darabonba/typescript';\n`, level);
      this.emit(`\n`);
    }

    const usedTypes = this.analyser.usedTypes;
    if (usedTypes.get('readable')) {
      this.emit(`import { Readable } from 'stream';\n`, level);
    }
    this.emit('\n');

    if (this.ctx.binding && this.ctx.binding.import) {
      this.emit(this.ctx.binding.import.trim() + '\n', level);
      this.emit(`\n`);
    }
    const usedComponents = this.analyser.usedComponents;
    if (usedComponents.size > 0) {
      this.emit('// imports\n', level);
      for (const [key, component] of usedComponents) {
        if (key === this.name) {
          continue;
        }
        const filename = path.basename(component.ctx.filename, '.dara');
        this.emit(`import { ${key} } from './${filename}';\n`, level);
      }
      this.emit('\n');
    }

    if (ast.imports.length > 0) {
      const libraries = this.ctx.pkg.libraries;
      this.emit('// import extern packages\n', level);
      for (let i = 0; i < ast.imports.length; i++) {
        const item = ast.imports[i];
        const aliasId = item.aliasId.lexeme;
        const pkgInfo = libraries.get(aliasId).pkgInfo;
        const tsPkg = pkgInfo.releases && pkgInfo.releases.ts;
        if (!tsPkg) {
          throw new Error(`The '${aliasId}' has no TypeScript supported.`);
        }
        const [pkgName] = tsPkg.split(':');
        this.emit(`import * as ${aliasId} from '${pkgName}';\n`, level);
      }
      this.emit('\n');
    }
  },

  emitParams: function (ast, level) {
    assert.equal(ast.type, 'params');
    this.emit('(');
    for (var i = 0; i < ast.params.length; i++) {
      if (i !== 0) {
        this.emit(', ');
      }
      const node = ast.params[i];
      assert.equal(node.type, 'param');
      const name = node.paramName.lexeme;
      this.emit(`${avoidReserveName(name)}: `);
      this.emitType(node.paramType, level);
    }
    this.emit(')');
  },

  emitReturnType: function (ast, level) {
    this.emit(`: `);
    if (ast.isAsync) {
      this.emit(`Promise<`);
    }
    this.emitType(ast.returnType, level);
    if (ast.isAsync) {
      this.emit(`>`);
    }
  },

  emitComponent(ast, level) {
    if (ast.tag === Tag.ID) {
      this.emit(`${ast.lexeme}`);
    } else {
      this.emit(`${ast.aliasId.lexeme}.${ast.component.lexeme}`);
    }
  }
};

module.exports = traits;