import * as $dara from '@darabonba/typescript';

import { Readable } from 'stream';

// imports
import { M } from './m';

// import extern packages
import * as $source from '@scope/name';

export class MyModel extends $dara.Model {
  stringfield: string;
  optional?: string;
  bytesfield: Buffer;
  stringarrayfield: string[];
  mapfield: {[key: string]: string};
  name: string;
  subarray: M[];
  maparray: {[key: string]: any}[];
  numberfield: number;
  floatfield: number;
  doublefield: number;
  longfield: number;
  readable: Readable;
  existModel: $source.Model;
  moduleField: $source.Module;
  complexList: string[][][];
  description: string;

  toMap(): {[key: string]: any} {
    let map: {[key: string]: any} = {};
    $dara.setToMap(map, 'stringfield', $dara.mapify(this.stringfield));
    $dara.setToMap(map, 'optional', $dara.mapify(this.optional));
    $dara.setToMap(map, 'bytesfield', $dara.mapify(this.bytesfield));
    $dara.setToMap(map, 'stringarrayfield', $dara.mapify(this.stringarrayfield));
    $dara.setToMap(map, 'mapfield', $dara.mapify(this.mapfield));
    $dara.setToMap(map, 'realName', $dara.mapify(this.name));
    $dara.setToMap(map, 'subarray', $dara.mapify(this.subarray));
    $dara.setToMap(map, 'maparray', $dara.mapify(this.maparray));
    $dara.setToMap(map, 'numberfield', $dara.mapify(this.numberfield));
    $dara.setToMap(map, 'floatfield', $dara.mapify(this.floatfield));
    $dara.setToMap(map, 'doublefield', $dara.mapify(this.doublefield));
    $dara.setToMap(map, 'longfield', $dara.mapify(this.longfield));
    $dara.setToMap(map, 'readable', $dara.mapify(this.readable));
    $dara.setToMap(map, 'existModel', $dara.mapify(this.existModel));
    $dara.setToMap(map, 'moduleField', $dara.mapify(this.moduleField));
    $dara.setToMap(map, 'complexList', $dara.mapify(this.complexList));
    $dara.setToMap(map, 'description', $dara.mapify(this.description));
    return map;
  }

  static from(map: {[key: string]: any}): MyModel {
    let model = new MyModel();
    if (!$dara.isUnset(map['stringfield'])) {
      model.stringfield = map['stringfield'];
    }
    if (!$dara.isUnset(map['optional'])) {
      model.optional = map['optional'];
    }
    if (!$dara.isUnset(map['bytesfield'])) {
      model.bytesfield = map['bytesfield'];
    }
    if (!$dara.isUnset(map['stringarrayfield'])) {
    }
    if (!$dara.isUnset(map['mapfield'])) {
    }
    if (!$dara.isUnset(map['realName'])) {
      model.name = map['realName'];
    }
    if (!$dara.isUnset(map['subarray'])) {
    }
    if (!$dara.isUnset(map['maparray'])) {
    }
    if (!$dara.isUnset(map['numberfield'])) {
      model.numberfield = map['numberfield'];
    }
    if (!$dara.isUnset(map['floatfield'])) {
      model.floatfield = map['floatfield'];
    }
    if (!$dara.isUnset(map['doublefield'])) {
      model.doublefield = map['doublefield'];
    }
    if (!$dara.isUnset(map['longfield'])) {
      model.longfield = map['longfield'];
    }
    if (!$dara.isUnset(map['readable'])) {
      model.readable = map['readable'];
    }
    if (!$dara.isUnset(map['existModel'])) {
    }
    if (!$dara.isUnset(map['moduleField'])) {
    }
    if (!$dara.isUnset(map['complexList'])) {
    }
    if (!$dara.isUnset(map['description'])) {
      model.description = map['description'];
    }
    return model;
  }

  setStringfield(value: string): MyModel {
    this.stringfield = value;
    return this;
  }

  setOptional(value: string): MyModel {
    this.optional = value;
    return this;
  }

  setBytesfield(value: Buffer): MyModel {
    this.bytesfield = value;
    return this;
  }

  setStringarrayfield(value: string[]): MyModel {
    this.stringarrayfield = value;
    return this;
  }

  setMapfield(value: {[key: string]: string}): MyModel {
    this.mapfield = value;
    return this;
  }

  setName(value: string): MyModel {
    this.name = value;
    return this;
  }

  setSubarray(value: M[]): MyModel {
    this.subarray = value;
    return this;
  }

  setMaparray(value: {[key: string]: any}[]): MyModel {
    this.maparray = value;
    return this;
  }

  setNumberfield(value: number): MyModel {
    this.numberfield = value;
    return this;
  }

  setFloatfield(value: number): MyModel {
    this.floatfield = value;
    return this;
  }

  setDoublefield(value: number): MyModel {
    this.doublefield = value;
    return this;
  }

  setLongfield(value: number): MyModel {
    this.longfield = value;
    return this;
  }

  setReadable(value: Readable): MyModel {
    this.readable = value;
    return this;
  }

  setExistModel(value: $source.Model): MyModel {
    this.existModel = value;
    return this;
  }

  setModuleField(value: $source.Module): MyModel {
    this.moduleField = value;
    return this;
  }

  setComplexList(value: string[][][]): MyModel {
    this.complexList = value;
    return this;
  }

  setDescription(value: string): MyModel {
    this.description = value;
    return this;
  }
}
