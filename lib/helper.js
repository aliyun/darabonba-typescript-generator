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

  return str.lexeme || str.name;
}

function _upperFirst(str) {
  return str[0].toUpperCase() + str.substring(1);
}

function _subModelName(name) {
  return name.split('.').map((name) => _upperFirst(name)).join('');
}

function _string(str) {
  return str.string;
}

function _type(name) {
  if (name === 'integer' || name === 'long' || name === 'int64' ||
    name === 'float' || name === 'int32' || name === 'double' || name === 'long') {
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
  _name, _string, _type, _subModelName, _vid, _upperFirst,
  REQUEST, RESPONSE, CORE
};