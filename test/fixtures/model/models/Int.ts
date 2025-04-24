// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


export class INT extends $dara.Model {
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

  validate() {
    $dara.Model.validateRequired("int8", this.int8);
    $dara.Model.validateRequired("uint8", this.uint8);
    $dara.Model.validateRequired("int16", this.int16);
    $dara.Model.validateRequired("uint16", this.uint16);
    $dara.Model.validateRequired("int32", this.int32);
    $dara.Model.validateRequired("uint32", this.uint32);
    $dara.Model.validateRequired("int64", this.int64);
    $dara.Model.validateRequired("uint64", this.uint64);
    $dara.Model.validateRequired("float", this.float);
    $dara.Model.validateRequired("double", this.double);
    $dara.Model.validateRequired("long", this.long);
    $dara.Model.validateRequired("number", this.number);
    $dara.Model.validateRequired("integer", this.integer);
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

