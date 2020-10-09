'use strict';

const fs = require('fs').promises;
const path = require('path');

class Emitter {
  constructor(config) {
    this.indent = config.indent || '  ';
    this.output = '';
    this.filename = config.filename;
  }

  emit(str, level = 0) {
    this.output += this.indent.repeat(level) + str;
  }

  async save() {
    await fs.mkdir(path.dirname(this.filename), {
      recursive: true
    });
    await fs.writeFile(this.filename, this.output);
  }
}

module.exports = Emitter;
