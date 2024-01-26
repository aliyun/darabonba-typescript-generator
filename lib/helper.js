'use strict';

const REQUEST = 'request_';
const RESPONSE = 'response_';
const CORE = '$tea';

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
    return '$tea.Request';
  }

  if (name === '$Response') {
    return '$tea.Response';
  }

  if (name === '$Model') {
    return '$tea.Model';
  }

  if (name === '$Error') {
    return '$tea.BaseError';
  }

  if (name === '$Date') {
    return '$tea.Date';
  }

  if (name === '$File') {
    return '$tea.File';
  }

  if (name === '$URL') {
    return '$tea.URL';
  }

  if (name === '$Stream') {
    return '$tea.Stream';
  }

  if (name === 'object') {
    return '{[key: string]: any}';
  }

  if (name === 'bytes') {
    return `Buffer`;
  }

  return name;
}

function _vid(vid) {
  return `_${_name(vid).substr(1)}`;
}

module.exports = {
  _name, _string, _type, _subModelName, _vid, _upperFirst,
  _isBinaryOp, _escape,
  REQUEST, RESPONSE, CORE
};