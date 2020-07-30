// This file is auto-generated, don't edit it
import Source from '@scope/name';
import { Readable } from 'stream';
import * as $tea from '@alicloud/tea-typescript';

export class M extends $tea.Model {
  static names(): { [key: string]: string } {
    return {
    };
  }

  static types(): { [key: string]: any } {
    return {
    };
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

export class MyModel extends $tea.Model {
  stringfield: string;
  bytesfield: Buffer;
  stringarrayfield: string[];
  mapfield: { [key: string]: string };
  name: string;
  submodel: MyModelSubmodel;
  subarraymodel: MyModelSubarraymodel[];
  subarray: M[];
  maparray: { [key: string]: any }[];
  object: {[key: string]: any};
  numberfield: number;
  floatfield: number;
  doublefield: number;
  longfield: number;
  readable: Readable;
  request: $tea.Request;
  existModel: M;
  moduleField: Source;
  static names(): { [key: string]: string } {
    return {
      stringfield: 'stringfield',
      bytesfield: 'bytesfield',
      stringarrayfield: 'stringarrayfield',
      mapfield: 'mapfield',
      name: 'realName',
      submodel: 'submodel',
      subarraymodel: 'subarraymodel',
      subarray: 'subarray',
      maparray: 'maparray',
      object: 'object',
      numberfield: 'numberfield',
      floatfield: 'floatfield',
      doublefield: 'doublefield',
      longfield: 'longfield',
      readable: 'readable',
      request: 'request',
      existModel: 'existModel',
      moduleField: 'moduleField',
    };
  }

  static types(): { [key: string]: any } {
    return {
      stringfield: 'string',
      bytesfield: 'Buffer',
      stringarrayfield: { 'type': 'array', 'itemType': 'string' },
      mapfield: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
      name: 'string',
      submodel: MyModelSubmodel,
      subarraymodel: { 'type': 'array', 'itemType': MyModelSubarraymodel },
      subarray: { 'type': 'array', 'itemType': M },
      maparray: { 'type': 'array', 'itemType': { 'type': 'map', 'keyType': 'string', 'valueType': 'any' } },
      object: { 'type': 'map', 'keyType': 'string', 'valueType': 'any' },
      numberfield: 'number',
      floatfield: 'number',
      doublefield: 'number',
      longfield: 'number',
      readable: 'Readable',
      request: $tea.Request,
      existModel: M,
      moduleField: Source,
    };
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

export class INT extends $tea.Model {
  int8: number;
  uint8: number;
  int16: number;
  uint16: number;
  int32: number;
  uint32: number;
  int64: number;
  uint64: number;
  float: number;
  double: number;
  long: number;
  number: number;
  integer: number;
  static names(): { [key: string]: string } {
    return {
      int8: 'int8',
      uint8: 'uint8',
      int16: 'int16',
      uint16: 'uint16',
      int32: 'int32',
      uint32: 'uint32',
      int64: 'int64',
      uint64: 'uint64',
      float: 'float',
      double: 'double',
      long: 'long',
      number: 'number',
      integer: 'integer',
    };
  }

  static types(): { [key: string]: any } {
    return {
      int8: 'number',
      uint8: 'number',
      int16: 'number',
      uint16: 'number',
      int32: 'number',
      uint32: 'number',
      int64: 'number',
      uint64: 'number',
      float: 'number',
      double: 'number',
      long: 'number',
      number: 'number',
      integer: 'number',
    };
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

export class MyModelSubmodel extends $tea.Model {
  stringfield: string;
  static names(): { [key: string]: string } {
    return {
      stringfield: 'stringfield',
    };
  }

  static types(): { [key: string]: any } {
    return {
      stringfield: 'string',
    };
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

export class MyModelSubarraymodel extends $tea.Model {
  static names(): { [key: string]: string } {
    return {
    };
  }

  static types(): { [key: string]: any } {
    return {
    };
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}


export default class Client {


}
