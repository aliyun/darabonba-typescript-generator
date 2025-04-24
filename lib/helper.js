'use strict';

const REQUEST = 'request_';
const RESPONSE = 'response_';
const CORE = '$dara';
const fs = require('fs');
const path = require('path');

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

function _snakeCase(str) {
  if (!str) {
    return '';
  }

  let res = '';
  let tmp = '';
  
  for (const [, c] of [...str].entries()) {
    // 检查字符是否为大写字母或数字
    if (/[A-Z0-9]/.test(c)) {
      tmp += c;
    } else {
      if (tmp.length > 0) {
        res += (res === '' ? tmp.toLowerCase() : '_' + tmp.toLowerCase());
        tmp = '';
      }
      res += c;
    }
  }
  
  if (tmp.length > 0) {
    res += (res === '' ? tmp.toLowerCase() : '_' + tmp.toLowerCase());
  }

  return res;
}

function _upperFirst(str) {
  return str[0].toUpperCase() + str.substring(1);
}

function _subModelName(name) {
  return name.split('.').map((name) => _upperFirst(name)).join('');
}


function _camelCase(str, split = '_') {
  // 先将字符串中的下划线拆分
  if (str.indexOf(split) > -1) {
    let tmp = str.split(split);
    tmp = tmp.map((s, i) => {
      // 如果是第一个单词则不处理，其他单词首字母大写
      return _upperFirst(s);
    });
    str = tmp.join('');
  } else {
    // 如果没有下划线，对整个字符串首字母大写
    str = _upperFirst(str);
  }
  
  return str;
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


function _type(name, usedTypes = []) {
  let type = name;
  if (name === 'integer' || name === 'number' ||
    name === 'int8' || name === 'uint8' ||
    name === 'int16' || name === 'uint16' ||
    name === 'int32' || name === 'uint32' ||
    name === 'int64' || name === 'uint64' ||
    name === 'long' || name === 'ulong' ||
    name === 'float'  || name === 'double') {
    type = 'number';
  }

  if (name === 'readable') {
    type = 'Readable';
  }

  if (name === 'writable') {
    type = 'Writable';
  }

  if (name === '$Request') {
    type = '$dara.Request';
  }

  if (name === '$Response') {
    type = '$dara.Response';
  }

  if (name === '$Model') {
    type = '$dara.Model';
  }

  if (name === '$Error') {
    type = '$dara.BaseError';
  }

  if (name === '$SSEEvent') {
    type = '$dara.SSEEvent';
  }

  if (name === '$RetryOptions') {
    type = '$dara.RetryOptions';
  }

  if (name === '$RuntimeOptions') {
    type = '$dara.RuntimeOptions';
  }

  if (name === '$ResponseError') {
    type = '$dara.ResponseError';
  }

  if (name === '$FileField') {
    type = '$dara.FileField';
  }

  if (name === '$ExtendsParameters') {
    type = '$dara.ExtendsParameters';
  }

  if (name === '$Date') {
    type = '$dara.Date';
  }

  if (name === '$File') {
    type = '$dara.File';
  }

  if (name === '$URL') {
    type = '$dara.URL';
  }

  if (name === '$Stream') {
    type = '$dara.Stream';
  }

  if (name === 'object') {
    type = '{[key: string]: any}';
  }

  if (name === 'bytes') {
    type = `Buffer`;
  }

  usedTypes.push(type);

  return type;
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

function _removeFilesInDirectory(directoryPath) {
  if(!fs.existsSync(directoryPath)) {
    return;
  }
  const files = fs.readdirSync(directoryPath);
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      _removeFilesInDirectory(filePath);
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = {
  _name, _string, _type, _subModelName, _vid, _upperFirst,
  _isBinaryOp, _escape, _isDefault, _snakeCase, _camelCase,
  REQUEST, RESPONSE, CORE, _removeFilesInDirectory
};