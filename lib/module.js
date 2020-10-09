'use strict';

const path = require('path');
const assert = require('assert');

const { comment } = require('@darabonba/parser');

const {
  avoidReserveName,
  _type, _vid, _string,
  _name, upperFirst
} = require('./helper');

const CORE = '$dara';

const Emitter = require('./emitter');
const { Tag } = require('@darabonba/parser');

class Module extends Emitter {
  constructor(item, ctx) {
    const filename = path.basename(item.ctx.filename, '.dara');
    super({
      filename: path.join(ctx.config.outputDir, 'src', `${filename}.ts`)
    });
    this.ast = item.ast;
    this.comments = item.ast.comments;
    this.name = item.ast.name.lexeme;
    this.parentModule = item.analyser.parentModule;
    this.implements = item.ast.implements;
    this.analyser = item.analyser;
    this.ctx = ctx;
  }

  visit() {
    this.emitModule(this.ast, 0);
  }

  emitModule(ast, level) {
    this.emit(`// This file is auto-generated, don't edit it\n`, level);
    this.emit(`\n`);
    this.emitImports(ast, level);
    this.emitAnnotation(ast.annotation, level);
    this.emit(`export class ${this.name}`, level);
    if (this.parentModule) {
      this.emit(` extends ${this.parentModule.name}`);
    }
    if (this.implements.length > 0) {
      this.emit(` implements `);
      for (let i = 0; i < this.implements.length; i++) {
        const item = this.implements[i];
        if (i > 0) {
          this.emit(', ');
        }
        this.emit(`${_name(item)}`);
      }
    }
    this.emit(` {\n`);
    this.emitTypes(this.ast, level);

    ast.moduleBody.nodes.forEach((item) => {
      if (item.type === 'function') {
        this.emitFunction(item, level + 1);
      } else if (item.type === 'init') {
        this.emitInit(item, level + 1);
      }
    });

    this.emit(`}\n`);
  }

  emitTypes(ast, level) {
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'type';
    }).forEach((item) => {
      let comments = comment.getFrontComments(this.comments, item.tokenRange[0]);
      this.emitComments(comments, level + 1);
      this.emit(`${_vid(item.vid)}: `, level + 1);
      this.emitType(item.value);
      this.emit(`;\n`);
    });
    this.emit('\n');
  }

  emitInit(ast, level) {
    assert.equal(ast.type, 'init');
    this.emitAnnotation(ast.annotation, level);
    let comments = comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.emitComments(comments, level);
    this.emit(`constructor`, level);
    this.emitParams(ast.params, level);
    this.emit(` {\n`);
    if (ast.initBody) {
      this.emitStmts(ast.initBody, level + 1);
    }

    this.emit(`}\n`, level);
    this.emit(`\n`);
  }

  emitFunction(ast, level) {
    this.emitAnnotation(ast.annotation, level);
    let comments = comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.emitComments(comments, level);
    const functionName = _name(ast.functionName);
    this.emit('', level);
    if (ast.isStatic) {
      this.emit('static ');
    }
    if (ast.isAsync) {
      this.emit('async ');
    }
    this.emit(`${functionName}`);
    this.emitParams(ast.params, level);
    this.emitReturnType(ast);
    this.emit(' {\n');
    if (ast.functionBody) {
      this.emitFunctionBody(ast.functionBody, level + 1);
    } else {
      if (!this.ctx.binding.methods[functionName]) {
        process.stdout.write(`${functionName}(`);
        for (var i = 0; i < ast.params.params.length; i++) {
          if (i !== 0) {
            process.stdout.write(', ');
          }
          const node = ast.params.params[i];
          assert.equal(node.type, 'param');
          const name = node.paramName.lexeme;
          process.stdout.write(`${avoidReserveName(name)}: ${this.getType(node.paramType)}`);
        }
        process.stdout.write(')\n');
        throw new Error(`the binding for ${this.name}/${functionName} is undefined`);
      }
      const binding = this.ctx.binding.methods[functionName];
      binding.trim().split('\n').forEach((line) => {
        this.emit(`${line.trimRight()}\n`, level + 1);
      });
    }
    this.emit('}\n', level);
    this.emit(`\n`);
  }

  emitFunctionBody(ast, level) {
    assert.equal(ast.type, 'functionBody');
    this.emitStmts(ast.stmts, level);
  }

  emitStmts(ast, level) {
    assert.equal(ast.type, 'stmts');
    let node;
    let last;

    for (var i = 0; i < ast.stmts.length; i++) {
      node = ast.stmts[i];
      if (last) {
        if (node.type === 'for' || node.type === 'for_of' || node.type === 'try') {
          this.emit('\n');
        } else if (last.type === 'for' || last.type === 'for_of'
          || last.type === 'if' || last.type === 'try') {
          this.emit('\n');
        }
      }

      this.emitStmt(node, level);
      last = node;
    }

    if (node) {
      // find the last node's back comment
      let comments = comment.getBackComments(this.comments, node.tokenRange[1]);
      this.emitComments(comments, level);
    }

    if (ast.stmts.length === 0) {
      // empty block's comment
      let comments = comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
      this.emitComments(comments, level);
    }
  }

  emitStmt(ast, level) {
    let comments = comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.emitComments(comments, level);
    if (ast.type === 'return') {
      this.emitReturn(ast, level);
    } else if (ast.type === 'if') {
      this.emitIf(ast, level);
    } else if (ast.type === 'throw') {
      this.emitThrow(ast, level);
    } else if (ast.type === 'assign') {
      this.emitAssign(ast, level);
    } else if (ast.type === 'break') {
      this.emit(`break;\n`, level);
    } else if (ast.type === 'declare') {
      this.emitDeclare(ast, level);
    } else if (ast.type === 'while') {
      this.emitWhile(ast, level);
    } else if (ast.type === 'for') {
      this.emitFor(ast, level);
    } else if (ast.type === 'for_of') {
      this.emitForOf(ast, level);
    } else if (ast.type === 'try') {
      this.emitTry(ast, level);
    } else {
      this.emit(``, level);
      this.emitExpr(ast, level);
      this.emit(';\n');
    }
  }

  emitWhile(ast, level) {
    assert.equal(ast.type, 'while');
    this.emit('\n');
    this.emit('while (', level);
    this.emitExpr(ast.condition, level + 1);
    this.emit(') {\n');
    this.emitStmts(ast.stmts, level + 1);
    this.emit('}\n', level);
  }

  emitFor(ast, level) {
    assert.equal(ast.type, 'for');
    this.emit(`for (`, level);
    this.emitExpr(ast.init, level);
    this.emit('; ');
    this.emitExpr(ast.test, level);
    this.emit('; ');
    this.emitExpr(ast.update, level);
    this.emit(') {\n');
    this.emitStmts(ast.stmts, level + 1);
    this.emit('}\n', level);
  }

  emitForOf(ast, level) {
    assert.equal(ast.type, 'for_of');
    this.emit(`for (`, level);
    this.emitExpr(ast.left, level);
    this.emit(` of `);
    this.emitExpr(ast.right, level + 1);
    this.emit(') {\n');
    this.emitStmts(ast.stmts, level + 1);
    this.emit('}\n', level);
  }

  emitIf(ast, level) {
    assert.equal(ast.type, 'if');
    for (let i = 0; i < ast.branches.length; i++) {
      const branch = ast.branches[i];
      if (branch.type === 'if_branch') {
        if (i === 0) {
          this.emit('if (', level);
        } else {
          this.emit(' else if (');
        }
        this.emitExpr(branch.condition, level + 1);
        this.emit(') {\n');
        this.emitStmts(branch.stmts, level + 1);
        this.emit('}', level);
      } else {
        this.emit(' else {\n');
        this.emitStmts(branch.stmts, level + 1);
        this.emit('}', level);
      }
    }

    this.emit('\n');
  }

  emitTry(ast, level) {
    assert.equal(ast.type, 'try');
    this.emit('try {\n', level);
    this.emitStmts(ast.tryBlock, level + 1);
    this.emit('}', level);
    if (ast.catchBlock) {
      this.emit(` catch (${_name(ast.catchId)}) {\n`);
      this.emitStmts(ast.catchBlock, level + 1);
      this.emit('}', level);
    }
    if (ast.finallyBlock) {
      this.emit(' finally {\n');
      this.emitStmts(ast.finallyBlock, level + 1);
      this.emit('}', level);
    }
    this.emit('\n');
  }

  emitThrow(ast, level) {
    this.emit(`throw ${CORE}.newError(`, level);
    this.emitMap(ast.expr, level);
    this.emit(');\n');
  }

  emitAssign(ast, level) {
    this.emit(``, level);
    this.emitExpr(ast.left, level);
    this.emit(' = ');
    this.emitExpr(ast.expr, level);
    this.emit(';\n');
  }

  emitDeclare(ast, level) {
    var id = _name(ast.id);
    this.emit(`let ${avoidReserveName(id)}`, level);
    if (ast.expectedType) {
      this.emit(` : `);
      this.emitType(ast.expectedType, level);
    }
    this.emit(` = `);
    this.emitExpr(ast.expr, level);
    this.emit(';\n');
  }

  emitExpr(ast, level) {
    if (ast.type === 'boolean') {
      this.emit(ast.value);
    } else if (ast.type === 'string') {
      this.emit(`"${_string(ast.value)}"`);
    } else if (ast.type === 'number') {
      this.emit(ast.value.value);
    } else if (ast.type === 'null') {
      this.emit(`null`);
    } else if (ast.type === 'empty') {
      this.emit(``);
    } else if (ast.type === 'id') {
      this.emitId(ast, level);
    } else if (ast.type === 'property') {
      this.emitProperty(ast);
    } else if (ast.type === 'template_string') {
      this.emit('`');
      for (var i = 0; i < ast.elements.length; i++) {
        var item = ast.elements[i];
        if (item.type === 'element') {
          this.emit(_string(item.value));
        } else if (item.type === 'expr') {
          this.emit('${');
          this.emitExpr(item.expr, level);
          this.emit('}');
        }
      }
      this.emit('`');
    } else if (ast.type === 'call') {
      this.emitCall(ast, level);
    } else if (ast.type === 'construct_module') {
      this.emitConstructModule(ast, level);
    } else if (ast.type === 'array') {
      this.emitArray(ast, level);
    } else if (ast.type === 'map') {
      this.emitMap(ast, level);
    } else if (ast.type === 'logical') {
      this.emitExpr(ast.left, level);
      this.emit(` ${ast.operator} `);
      this.emitExpr(ast.right, level);
    } else if (ast.type === 'binary') {
      this.emitExpr(ast.left, level);
      this.emit(` ${ast.operator} `);
      this.emitExpr(ast.right, level);
    } else if (ast.type === 'declare_expr') {
      this.emitDeclareExpr(ast, level);
    } else if (ast.type === 'assign') {
      this.emitAssignExpr(ast, level);
    } else if (ast.type === 'not') {
      this.emit('!');
      this.emitExpr(ast.expr, level);
    } else if (ast.type === 'construct_model') {
      this.emitConstructModel(ast, level);
    } else if (ast.type === 'member') {
      this.emitExpr(ast.object);
      this.emit(`[`);
      this.emitExpr(ast.index);
      this.emit(`]`);
    } else if (ast.type === 'super') {
      this.emitSuperCall(ast, level);
    } else if (ast.type === 'inline') {
      this.emitInlineCall(ast, level);
    } else if (ast.type === 'to') {
      this.emit(`${ast.to.lexeme}.from(`);
      this.emitExpr(ast.from, level);
      this.emit(`)`);
    } else {
      console.log(ast);
      throw new Error('unimpelemented');
    }
  }

  emitAssignExpr(ast, level) {
    this.emitExpr(ast.left, level);
    this.emit(' = ');
    this.emitExpr(ast.expr, level);
  }

  emitInlineCall(ast, level) {
    assert.equal(ast.type, 'inline');
    const name = ast.name.lexeme;
    switch (name) {
    case '#length':
      this.emitExpr(ast.args[0], level);
      this.emit(`.length`);
      break;
    case '#append':
      this.emit(`$dara.push(`);
      this.emitExpr(ast.args[0], level);
      this.emit(`, `);
      this.emitExpr(ast.args[1], level);
      this.emit(`)`);
      break;
    default:
      console.log(ast);
      throw new Error('unimpelemented');
    }
  }

  emitCall(ast, level) {
    assert.equal(ast.type, 'call');
    if (ast.isAsync) {
      this.emit(`await `);
    }
    if (ast.callee.type === 'id') {
      if (ast.isStatic) {
        this.emit(`${this.name}.`);
      } else {
        this.emit(`this.`);
      }
    }
    this.emitExpr(ast.callee, level);
    this.emitArgs(ast.args, level);
  }

  emitConstructModel(ast, level) {
    assert.equal(ast.type, 'construct_model');
    this.emit(`new `);
    this.emitComponent(ast.component, level);
    this.emit(`()`);
    if (ast.fields.fields.length === 0) {
      return;
    }

    for (let i = 0; i < ast.fields.fields.length; i++) {
      const item = ast.fields.fields[i];
      this.emit(`\n`);
      this.emit(`.set${upperFirst(item.key.lexeme)}(`, level + 1);
      this.emitExpr(item.expr, level);
      this.emit(`)`);
    }
  }

  emitConstructModule(ast, level) {
    assert.equal(ast.type, 'construct_module');
    this.emit('new ');
    this.emitComponent(ast.component, level);
    this.emitArgs(ast.args, level);
  }

  emitSuperCall(ast, level) {
    assert.equal(ast.type, 'super');
    this.emit(`super`);
    this.emitArgs(ast.args, level);
  }

  emitArgs(args, level) {
    this.emit('(');
    for (let i = 0; i < args.length; i++) {
      const expr = args[i];
      this.emitExpr(expr, level);
      if (i !== args.length - 1) {
        this.emit(', ');
      }
    }
    this.emit(')');
  }

  emitProperty(ast, level) {
    if (ast.object.type === 'id') {
      this.emitId(ast.object);
    } else {
      this.emitProperty(ast.object, level);
    }
    this.emit(`.${ast.property.lexeme}`);
  }

  emitId(ast, level) {
    if (ast.id.tag === Tag.ID) {
      this.emit(avoidReserveName(_name(ast.id)));
    } else if (ast.id.tag === Tag.VID) {
      this.emit(`this.${_vid(ast.id)}`);
    } else {
      this.emit(`${ast.id.lexeme}`);
    }
  }

  emitMap(ast, level) {
    if (ast.fields.length === 0) {
      this.emit(`{}`);
      return;
    }
    this.emit(`{\n`);
    for (let i = 0; i < ast.fields.length; i++) {
      const item = ast.fields[i];
      if (item.type === 'mapField') {
        this.emit(`'${_string(item.key)}': `, level + 1);
        this.emitExpr(item.expr);
      } else {
        this.emit(`...`, level + 1);
        this.emitExpr(item.expr);
      }
      if (i < ast.fields.length - 1) {
        this.emit(`,`);
      }
      this.emit(`\n`);
    }
    this.emit(`}`, level);
  }

  emitArray(ast, level) {
    if (ast.items.length === 0) {
      this.emit(`[]`);
      return;
    }
    this.emit(`[\n`);
    for (let i = 0; i < ast.items.length; i++) {
      this.emit('', level + 1);
      this.emitExpr(ast.items[i]);
      if (i < ast.items.length - 1) {
        this.emit(`,`);
      }
      this.emit(`\n`);
    }
    this.emit(`]`, level);
  }

  emitDeclareExpr(ast, level) {
    var id = _name(ast.id);
    this.emit(`let ${id}`);
    if (ast.expectedType) {
      this.emit(` : `);
      this.emitType(ast.expectedType, level);
    }
    if (ast.expr) {
      this.emit(` = `);
      this.emitExpr(ast.expr, level);
    }
  }

  emitReturn(ast, level) {
    assert.equal(ast.type, 'return');
    this.emit('return ', level);
    this.emitExpr(ast.expr, level);
    this.emit(';\n');
  }

  getType(ast) {
    if (ast.type === 'array') {
      return `${this.getType(ast.itemType)}[]`;
    }

    if (ast.type === 'map') {
      return `{[key: ${this.getType(ast.keyType)}]${this.getType(ast.valueType)}}`;
    }

    if (ast.tag === Tag.ID) {
      return _name(ast);
    }

    if (ast.tag === Tag.TYPE) {
      return _type(_name(ast));
    }

    console.log(ast);
    throw new Error('un-implemented');
  }
}

Object.assign(Module.prototype, require('./traits'));

module.exports = Module;
