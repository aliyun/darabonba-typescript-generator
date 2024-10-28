'use strict';
const DSL = require('@darabonba/parser');
const  { _vid, _name, _isDefault, CORE } = require('./helper');

const types = [
  'integer', 'int8', 'int16', 'int32', 
  'int64', 'long', 'ulong', 'string',
  'uint8', 'uint16', 'uint32', 'uint64',
  'number', 'float', 'double', 'boolean',
  'bytes', 'readable', 'writable', 'object', 'any'
];

const integers = [
  'integer', 'int8', 'int16', 'int32', 
  'int64', 'long', 'ulong',
  'uint8', 'uint16', 'uint32', 'uint64'
];

const floats = ['float', 'double'];

class Builtin {
  constructor(generator, module = '', methods = []){
    this.generator = generator;
    this.module = module;

    methods.forEach(method => {
      this[method] = function(args, level) {
        this.generator.emit(`${this.module}.${method}`);
        this.generator.visitArgs(args, level);
      };
    });
  }

  getInstanceName(ast) {
    if (ast.left.id.tag === DSL.Tag.Tag.VID) {
      this.generator.emit(`this.${_vid(ast.left.id)}`);
    } else {
      this.generator.emit(`${_name(ast.left.id)}`);
    }
  }
}

class Env extends Builtin {
  constructor(generator){
    super(generator, 'process.env');
  }

  get(args){
    const key = args[0];
    this.generator.emit(`${this.module }[`);
    this.generator.visitExpr(key);
    this.generator.emit('];');
  }

  set(args){
    const key = args[0];
    this.generator.emit(`${this.module }[`);
    this.generator.visitExpr(key);
    this.generator.emit('] = ');
    const value = args[1];
    this.generator.visitExpr(value);
    this.generator.emit(';');
  }
}

class Logger extends Builtin {
  constructor(generator){
    const methods = ['log', 'info', 'debug', 'error'];
    super(generator, 'console', methods);
  }

  warning(args, level){
    this.generator.emit(`${this.module}.warn`);
    this.generator.visitArgs(args, level);
  }
}

class XML extends Builtin {
  constructor(generator){
    const methods = ['parseXml', 'toXML'];
    super(generator, `${CORE}.XML`, methods);
  }
}

class URL extends Builtin {
  constructor(generator){
    const methods = ['parse', 'urlEncode', 'percentEncode', 'pathEncode'];
    super(generator, `${CORE}.URL`, methods);
  }
}

class Stream extends Builtin {
  constructor(generator){
    const methods = ['readAsBytes', 'readAsJSON', 'readAsString', 'readAsSSE'];
    super(generator, `${CORE}.Stream`, methods);
  }
}

class Number extends Builtin {
  constructor(generator){
    const methods = ['random', 'floor', 'round', 'min', 'max'];
    super(generator, 'Math', methods);
  }

  parseInt(ast) {
    this.generator.emit('parseInt(`${');
    this.getInstanceName(ast);
    this.generator.emit('}`)');
  }

  parseLong(ast) {
    this.generator.emit('parseInt(`${');
    this.getInstanceName(ast);
    this.generator.emit('}`)');
  }

  parseFloat(ast) {
    this.generator.emit('parseFloat(`${');
    this.getInstanceName(ast);
    this.generator.emit('}`)');
  }

  parseDouble(ast) {
    this.generator.emit('parseFloat(`${');
    this.getInstanceName(ast);
    this.generator.emit('}`)');
  }

  itol(ast) {
    this.getInstanceName(ast);
  }

  ltoi(ast) {
    this.getInstanceName(ast);
  }
}

class JSON extends Builtin {
  constructor(generator){
    const methods = ['stringify'];
    super(generator, 'JSON', methods);
  }

  parseJSON(args, level){
    this.generator.emit(`${this.module }.parse`);
    this.generator.visitArgs(args, level);
  }
}

class Form extends Builtin {
  constructor(generator){
    const methods = ['toFormString', 'getBoundary', 'toFileForm'];
    super(generator, `${CORE}.Form`, methods);
  }
}

class File extends Builtin {
  constructor(generator){
    const methods = ['createReadStream', 'createWriteStream', 'exists'];
    super(generator, `${CORE}.File`, methods);
  }
}

class Bytes extends Builtin {
  constructor(generator){
    const methods = ['from'];
    super(generator, 'Buffer', methods);
  }

  toString(ast, level, type = 'utf8'){ 
    this.getInstanceName(ast, level);
    this.generator.emit(`.toString("${type}")`);
  }

  toHex(ast, level){ 
    this.toString(ast, level, 'hex');
  }

  toBase64(ast, level){ 
    this.toString(ast, level, 'base64');
  }

  toJSON(ast, level) {
    this.toString(ast, level);
  }

  length(ast){ 
    this.getInstanceName(ast);
    this.generator.emit('.length');
  }
}


class Converter {
  constructor(generator){
    this.generator = generator;
    integers.forEach(type => {
      this[type] = function(args) {
        const expr = args[0];
        if(_isDefault(expr)) {
          generator.visitExpr(expr);
          return;
        }
        generator.emit('parseInt(');
        generator.visitExpr(expr);
        generator.emit(')');
      };
    });

    floats.forEach(type => {
      this[type] = function(args) {
        const expr = args[0];
        if(_isDefault(expr)) {
          generator.visitExpr(expr);
          return;
        }
        generator.emit('parseFloat(');
        generator.visitExpr(expr);
        generator.emit(')');
      };
    });
  }

  string(args) {
    const expr = args[0];
    if(_isDefault(expr)) {
      this.generator.visitExpr(expr);
      return;
    }
    this.generator.emit('String(');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }

  number(args) {
    const expr = args[0];
    if(_isDefault(expr)) {
      this.generator.visitExpr(expr);
      return;
    }
    this.generator.emit('Number(');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }

  boolean(args) {
    const expr = args[0];
    if(_isDefault(expr)) {
      this.generator.visitExpr(expr);
      return;
    }
    this.generator.emit('Boolean(');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }

  bytes(args) {
    const expr = args[0];
    this.generator.emit('Buffer.from(');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }

  any(args){
    const expr = args[0];
    this.generator.visitExpr(expr);
  }

  object(args){
    const expr = args[0];
    this.generator.visitExpr(expr);
  }

  readable(args){
    const expr = args[0];
    this.generator.emit('Readable.from(');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }

  writable(args){
    const expr = args[0];
    this.generator.emit('Writable.from(');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }
}

class Func {
  constructor(generator){
    this.generator = generator;
    ['sleep', 'isNull'].forEach(method => {
      this[method] = function(args) {
        generator.emit(`$dara.${method}`);
        generator.visitArgs(args);
      };
    });
  }

  equal(args){
    this.generator.visitExpr(args[0]);
    this.generator.emit(' === ');
    this.generator.visitExpr(args[1]);
  }

  default(args){
    this.generator.visitExpr(args[0]);
    this.generator.emit(' || ');
    this.generator.visitExpr(args[1]);
  }
}

class String extends Builtin {
  replace(ast, level) {
    this.getInstanceName(ast);
    const args = ast.args;
    const regex = args[0].value.string;
    this.generator.emit('.replace');
    this.generator.emit(`(${regex}, `);
    this.generator.visitExpr(args[1], level);
    this.generator.emit(')');
  }

  contains(ast, level) {
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit('.includes');
    this.generator.visitArgs(args, level);
  }

  length(ast) {
    this.getInstanceName(ast);
    this.generator.emit('.length');
  }

  hasPrefix(ast, level) {
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit('.startsWith');
    this.generator.visitArgs(args, level);
  }

  hasSuffix(ast, level) {
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit('.endsWith');
    this.generator.visitArgs(args, level);
  }

  index(ast, level) {
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit('.indexOf');
    this.generator.visitArgs(args, level);
  }

  subString(ast, level) {
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit('.slice');
    this.generator.visitArgs(args, level);
  }

  toLower(ast) {
    this.getInstanceName(ast);
    this.generator.emit('.toLowerCase');
    this.generator.emit('()');
  }

  toUpper(ast) {
    this.getInstanceName(ast);
    this.generator.emit('.toUpperCase');
    this.generator.emit('()');
  }

  equals(ast) {
    this.getInstanceName(ast);
    const args = ast.args;
    const expr = args[0];
    this.generator.emit(' == ');
    this.generator.visitExpr(expr);

  }

  empty(ast) {
    this.generator.emit('!');
    this.getInstanceName(ast);
  }

  toBytes(ast) {
    const args = ast.args;
    const expr = args[0];
    this.generator.emit('Buffer.from(');
    this.getInstanceName(ast);
    this.generator.emit(', ');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }

  parseInt(ast) {
    this.generator.emit('parseInt(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  parseLong(ast) {
    this.generator.emit('parseInt(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  parseFloat(ast) {
    this.generator.emit('parseFloat(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  parseDouble(ast) {
    this.generator.emit('parseFloat(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }
}

class Array extends Builtin {
  contains(ast, level) {
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit('.includes');
    this.generator.visitArgs(args, level);
  }

  length(ast) {
    this.getInstanceName(ast);
    this.generator.emit('.length');
  }

  index(ast, level) {
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit('.indexOf');
    this.generator.visitArgs(args, level);
  }

  get(ast, level) {
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit(`[`);
    const expr = args[0];
    this.generator.visitExpr(expr, level);
    this.generator.emit(`]`);
  }

  sort(ast) {
    this.generator.emit(`${CORE}.sort(`);
    this.getInstanceName(ast);
    this.generator.emit(', ');
    this.generator.visitExpr(ast.args[0]);
    this.generator.emit(')');
  }

  append(ast) {
    this.getInstanceName(ast);
    const position = ast.args[1];
    const value = ast.args[0];
    this.generator.emit('.splice(');
    this.generator.visitExpr(position);
    this.generator.emit(', 0, ');
    this.generator.visitExpr(value);
    this.generator.emit(')');
  }

  remove(ast) {
    this.getInstanceName(ast);
    const value = ast.args[0];
    this.generator.emit('.splice(');
    this.getInstanceName(ast);
    this.generator.emit('.indexOf(');
    this.generator.visitExpr(value);
    this.generator.emit('), 1)');
  }
}

class Map extends Builtin {

  length(ast) {
    this.generator.emit('Object.keys(');
    this.getInstanceName(ast);
    this.generator.emit(')');
    this.generator.emit('.length');
  }

  keySet(ast) {
    this.generator.emit('Object.keys(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  entries(ast) {
    this.generator.emit('Object.entries(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  toJSON(ast) {
    this.generator.emit('JSON.stringify(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  merge(ast) {
    this.generator.emit('$dara.merge(');
    this.getInstanceName(ast);
    this.generator.emit(' , ');
    this.generator.visitExpr(ast.args[0]);
    this.generator.emit(')');
  }
}

class Entry extends Builtin {

  key(ast) {
    this.getInstanceName(ast);
    this.generator.emit('[0]');
  }

  value(ast) {
    this.getInstanceName(ast);
    this.generator.emit('[1]');
  }
}

module.exports = (generator) => {
  const builtin = {};
  builtin['$Env'] = new Env(generator);
  builtin['$Logger'] = new Logger(generator);
  builtin['$XML'] = new XML(generator);
  builtin['$URL'] = new URL(generator);
  builtin['$Stream'] = new Stream(generator);
  builtin['$Number'] = new Number(generator);
  builtin['$JSON'] = new JSON(generator);
  builtin['$Form'] = new Form(generator);
  builtin['$File'] = new File(generator);
  builtin['$Bytes'] = new Bytes(generator);
  const converter = new Converter(generator);
  types.map(type => {
    builtin[`$${type}`] = converter;
  });

  const func = new Func(generator);
  builtin['$isNull'] = func;
  builtin['$sleep'] = func;
  builtin['$default'] = func;
  builtin['$equal'] = func;

  builtin['$String'] = new String(generator);
  builtin['$Array'] = new Array(generator);
  builtin['$Date'] = new Date(generator);
  builtin['$Map'] = new Map(generator);
  builtin['$Entry'] = new Entry(generator);

  return builtin;
};