'use strict';

const REQUEST = 'request_';
const RESPONSE = 'response_';
const CORE = '$tea';

function _name(str) {
  if (str.lexeme === '__request') {
    return REQUEST;
  }

  if (str.lexeme === '__response') {
    return RESPONSE;
  }

  return str.lexeme ? str.lexeme.replace(/-/g, '_') : str.name.replace(/-/g, '_');
}

function _upperFirst(str) {
  return str[0].toUpperCase() + str.substring(1);
}

function _fieldName(str) {
  let key = str.lexeme || str.name;
  if (key.indexOf('-') !== -1) {
    key = `'${key}'`;
  }
  return key;
}

function _moduleName(name) {
  return name.replace(/-/g, '_');
}

function _subModelName(name) {
  return name.split('.').map((name) => _upperFirst(name)).join('');
}

function _string(str) {
  if (str.string === '""') {
    return '\\"\\"';
  }
  return str.string.replace(/([^\\])"|^"/g, '$1\\"');
}

function _type(name) {
  if (name === 'integer' || name === 'number' ||
    name === 'int8' || name === 'uint8' ||
    name === 'int16' || name === 'uint16' ||
    name === 'int32' || name === 'uint32' ||
    name === 'int64' || name === 'uint64' ||
    name === 'long' || name === 'float'  || name === 'double') {
    return 'number';
  }

  if (name === 'readable') {
    return 'Readable';
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
  _name, _string, _type, _subModelName, _vid, _upperFirst, _moduleName, _fieldName,
  REQUEST, RESPONSE, CORE
};