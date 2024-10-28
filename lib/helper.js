'use strict';

const REQUEST = 'request_';
const RESPONSE = 'response_';
const CORE = '$dara';

function _escape(str) {
  return str.includes('-') ? `'${str}'` : str;
}

function _name(str) {
  if (str.lexeme === '__request') {
    return REQUEST;
  }

  if (str.lexeme === '__response') {
    return RESPONSE;
  }

  return str.lexeme || str.name;
}

function _upperFirst(str) {
  return str[0].toUpperCase() + str.substring(1);
}

function _subModelName(name) {
  return name.split('.').map((name) => _upperFirst(name)).join('');
}

function _string(str) { 
  if (str.string === '""') {
    return '\\"\\"';
  }
  return str.string.replace(/([^\\])"+|^"/g, function(str){
    return str.replace(/"/g, '\\"');
  });
}

function _isBinaryOp(type){
  const op = [
    'or', 'eq', 'neq',
    'gt', 'gte', 'lt',
    'lte', 'add', 'subtract',
    'div', 'multi', 'and'
  ];
  return op.includes(type);
}


function _type(name) {
  if (name === 'integer' || name === 'number' ||
    name === 'int8' || name === 'uint8' ||
    name === 'int16' || name === 'uint16' ||
    name === 'int32' || name === 'uint32' ||
    name === 'int64' || name === 'uint64' ||
    name === 'long' || name === 'ulong' ||
    name === 'float'  || name === 'double') {
    return 'number';
  }

  if (name === 'readable') {
    return 'Readable';
  }

  if (name === 'writable') {
    return 'Writable';
  }

  if (name === '$Request') {
    return '$dara.Request';
  }

  if (name === '$Response') {
    return '$dara.Response';
  }

  if (name === '$Model') {
    return '$dara.Model';
  }

  if (name === '$Error') {
    return '$dara.BaseError';
  }

  if (name === '$SSEEvent') {
    return '$dara.SSEEvent';
  }

  if (name === '$RetryOptions') {
    return '$dara.RetryOptions';
  }

  if (name === '$RuntimeOptions') {
    return '$dara.RuntimeOptions';
  }

  if (name === '$ResponseError') {
    return '$dara.ResponseError';
  }

  if (name === '$FileField') {
    return '$dara.FileField';
  }

  if (name === '$ExtendsParameters') {
    return '$dara.ExtendsParameters';
  }

  if (name === '$Date') {
    return '$dara.Date';
  }

  if (name === '$File') {
    return '$dara.File';
  }

  if (name === '$URL') {
    return '$dara.URL';
  }

  if (name === '$Stream') {
    return '$dara.Stream';
  }

  if (name === 'object') {
    return '{[key: string]: any}';
  }

  if (name === 'bytes') {
    return `Buffer`;
  }

  return name;
}

function _isDefault(expr) {
  if(expr.type !== 'call' || expr.left.type !== 'method_call') {
    return false;
  }
  const name = _name(expr.left.id);

  if(name !== '$default') {
    return false;
  }

  return true;
}

function _vid(vid) {
  return `_${_name(vid).substr(1)}`;
}

module.exports = {
  _name, _string, _type, _subModelName, _vid, _upperFirst,
  _isBinaryOp, _escape, _isDefault,
  REQUEST, RESPONSE, CORE
};