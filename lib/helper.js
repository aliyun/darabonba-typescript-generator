'use strict';

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

  if (name === 'bytes') {
    return `Buffer`;
  }

  return name;
}

function avoidReserveName(name) {
  const reserves = [
    'function'
  ];

  if (reserves.indexOf(name) !== -1) {
    return `${name}_`;
  }

  return name;
}

function _name(item) {
  return item.lexeme;
}

function _vid(vid) {
  return `_${_name(vid).substr(1)}`;
}

function _string(str) {
  return str.string;
}

function upperFirst(name) {
  return name.substring(0, 1).toUpperCase() + name.substring(1);
}

module.exports = {
  _type, avoidReserveName, _name, _vid,
  _string, upperFirst
};