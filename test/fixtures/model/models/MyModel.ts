// This file is auto-generated, don't edit it
import { Readable } from 'stream';
import * as $dara from '@darabonba/typescript';
import { MyModelSubmodel } from "./MyModelSubmodel";
import { MyModelSubarraymodel } from "./MyModelSubarraymodel";
import { M } from "./M";
import { MSubM } from "./MsubM";
import Source, * as $Source from '@scope/name';


export class MyModel extends $dara.Model {
  stringfield: string;
  bytesfield: Buffer;
  stringarrayfield: string[];
  mapfield: { [key: string]: string };
  name: string;
  submodel: MyModelSubmodel;
  subarraymodel: MyModelSubarraymodel[];
  subarray: M[];
  maparray: { [key: string]: any }[];
  modelArrayMap: { [key: string]: M[] };
  moduleModelMap: { [key: string]: $Source.Request };
  moduleModelArrayMap: { [key: string]: $Source.Request[] };
  subModelMap: { [key: string]: MSubM };
  modelMap: { [key: string]: M };
  moduleMap: { [key: string]: Source };
  object: {[key: string]: any};
  numberfield: number;
  floatfield: number;
  doublefield: number;
  longfield: number;
  readable: Readable;
  request: $dara.Request;
  existModel: M;
  moduleField: Source;
  complexList: string[][][];
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
      modelArrayMap: 'modelArrayMap',
      moduleModelMap: 'moduleModelMap',
      moduleModelArrayMap: 'moduleModelArrayMap',
      subModelMap: 'subModelMap',
      modelMap: 'modelMap',
      moduleMap: 'moduleMap',
      object: 'object',
      numberfield: 'numberfield',
      floatfield: 'floatfield',
      doublefield: 'doublefield',
      longfield: 'longfield',
      readable: 'readable',
      request: 'request',
      existModel: 'existModel',
      moduleField: 'moduleField',
      complexList: 'complexList',
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
      modelArrayMap: { 'type': 'map', 'keyType': 'string', 'valueType': { 'type': 'array', 'itemType': M } },
      moduleModelMap: { 'type': 'map', 'keyType': 'string', 'valueType': $Source.Request },
      moduleModelArrayMap: { 'type': 'map', 'keyType': 'string', 'valueType': { 'type': 'array', 'itemType': $Source.Request } },
      subModelMap: { 'type': 'map', 'keyType': 'string', 'valueType': MSubM },
      modelMap: { 'type': 'map', 'keyType': 'string', 'valueType': M },
      moduleMap: { 'type': 'map', 'keyType': 'string', 'valueType': Source },
      object: { 'type': 'map', 'keyType': 'string', 'valueType': 'any' },
      numberfield: 'number',
      floatfield: 'number',
      doublefield: 'number',
      longfield: 'number',
      readable: 'Readable',
      request: $dara.Request,
      existModel: M,
      moduleField: Source,
      complexList: { 'type': 'array', 'itemType': { 'type': 'array', 'itemType': { 'type': 'array', 'itemType': 'string' } } },
    };
  }

  validate() {
    $dara.Model.validateRequired("stringfield", this.stringfield);
    $dara.Model.validateRequired("bytesfield", this.bytesfield);
    if(Array.isArray(this.stringarrayfield)) {
      $dara.Model.validateArray(this.stringarrayfield);
    }
    $dara.Model.validateRequired("stringarrayfield", this.stringarrayfield);
    if(this.mapfield) {
      $dara.Model.validateMap(this.mapfield);
    }
    $dara.Model.validateRequired("mapfield", this.mapfield);
    $dara.Model.validateRequired("name", this.name);
    if(this.submodel && typeof (this.submodel as any).validate === 'function') {
      (this.submodel as any).validate();
    }
    $dara.Model.validateRequired("submodel", this.submodel);
    if(Array.isArray(this.subarraymodel)) {
      $dara.Model.validateArray(this.subarraymodel);
    }
    $dara.Model.validateRequired("subarraymodel", this.subarraymodel);
    if(Array.isArray(this.subarray)) {
      $dara.Model.validateArray(this.subarray);
    }
    $dara.Model.validateRequired("subarray", this.subarray);
    if(Array.isArray(this.maparray)) {
      $dara.Model.validateArray(this.maparray);
    }
    $dara.Model.validateRequired("maparray", this.maparray);
    if(this.modelArrayMap) {
      $dara.Model.validateMap(this.modelArrayMap);
    }
    $dara.Model.validateRequired("modelArrayMap", this.modelArrayMap);
    if(this.moduleModelMap) {
      $dara.Model.validateMap(this.moduleModelMap);
    }
    $dara.Model.validateRequired("moduleModelMap", this.moduleModelMap);
    if(this.moduleModelArrayMap) {
      $dara.Model.validateMap(this.moduleModelArrayMap);
    }
    $dara.Model.validateRequired("moduleModelArrayMap", this.moduleModelArrayMap);
    if(this.subModelMap) {
      $dara.Model.validateMap(this.subModelMap);
    }
    $dara.Model.validateRequired("subModelMap", this.subModelMap);
    if(this.modelMap) {
      $dara.Model.validateMap(this.modelMap);
    }
    $dara.Model.validateRequired("modelMap", this.modelMap);
    if(this.moduleMap) {
      $dara.Model.validateMap(this.moduleMap);
    }
    $dara.Model.validateRequired("moduleMap", this.moduleMap);
    $dara.Model.validateRequired("object", this.object);
    $dara.Model.validateRequired("numberfield", this.numberfield);
    $dara.Model.validateRequired("floatfield", this.floatfield);
    $dara.Model.validateRequired("doublefield", this.doublefield);
    $dara.Model.validateRequired("longfield", this.longfield);
    $dara.Model.validateRequired("readable", this.readable);
    $dara.Model.validateRequired("request", this.request);
    if(this.existModel && typeof (this.existModel as any).validate === 'function') {
      (this.existModel as any).validate();
    }
    $dara.Model.validateRequired("existModel", this.existModel);
    if(this.moduleField && typeof (this.moduleField as any).validate === 'function') {
      (this.moduleField as any).validate();
    }
    $dara.Model.validateRequired("moduleField", this.moduleField);
    if(Array.isArray(this.complexList)) {
      $dara.Model.validateArray(this.complexList);
    }
    $dara.Model.validateRequired("complexList", this.complexList);
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

