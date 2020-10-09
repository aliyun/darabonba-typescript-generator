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
  integer: number;

  toMap(): {[key: string]: any} {
    let map: {[key: string]: any} = {};
    $dara.setToMap(map, 'int8', $dara.mapify(this.int8));
    $dara.setToMap(map, 'uint8', $dara.mapify(this.uint8));
    $dara.setToMap(map, 'int16', $dara.mapify(this.int16));
    $dara.setToMap(map, 'uint16', $dara.mapify(this.uint16));
    $dara.setToMap(map, 'int32', $dara.mapify(this.int32));
    $dara.setToMap(map, 'uint32', $dara.mapify(this.uint32));
    $dara.setToMap(map, 'int64', $dara.mapify(this.int64));
    $dara.setToMap(map, 'uint64', $dara.mapify(this.uint64));
    $dara.setToMap(map, 'float', $dara.mapify(this.float));
    $dara.setToMap(map, 'double', $dara.mapify(this.double));
    $dara.setToMap(map, 'long', $dara.mapify(this.long));
    $dara.setToMap(map, 'integer', $dara.mapify(this.integer));
    return map;
  }

  static from(map: {[key: string]: any}): INT {
    let model = new INT();
    if (!$dara.isUnset(map['int8'])) {
      model.int8 = map['int8'];
    }
    if (!$dara.isUnset(map['uint8'])) {
      model.uint8 = map['uint8'];
    }
    if (!$dara.isUnset(map['int16'])) {
      model.int16 = map['int16'];
    }
    if (!$dara.isUnset(map['uint16'])) {
      model.uint16 = map['uint16'];
    }
    if (!$dara.isUnset(map['int32'])) {
      model.int32 = map['int32'];
    }
    if (!$dara.isUnset(map['uint32'])) {
      model.uint32 = map['uint32'];
    }
    if (!$dara.isUnset(map['int64'])) {
      model.int64 = map['int64'];
    }
    if (!$dara.isUnset(map['uint64'])) {
      model.uint64 = map['uint64'];
    }
    if (!$dara.isUnset(map['float'])) {
      model.float = map['float'];
    }
    if (!$dara.isUnset(map['double'])) {
      model.double = map['double'];
    }
    if (!$dara.isUnset(map['long'])) {
      model.long = map['long'];
    }
    if (!$dara.isUnset(map['integer'])) {
      model.integer = map['integer'];
    }
    return model;
  }

  setInt8(value: number): INT {
    this.int8 = value;
    return this;
  }

  setUint8(value: number): INT {
    this.uint8 = value;
    return this;
  }

  setInt16(value: number): INT {
    this.int16 = value;
    return this;
  }

  setUint16(value: number): INT {
    this.uint16 = value;
    return this;
  }

  setInt32(value: number): INT {
    this.int32 = value;
    return this;
  }

  setUint32(value: number): INT {
    this.uint32 = value;
    return this;
  }

  setInt64(value: number): INT {
    this.int64 = value;
    return this;
  }

  setUint64(value: number): INT {
    this.uint64 = value;
    return this;
  }

  setFloat(value: number): INT {
    this.float = value;
    return this;
  }

  setDouble(value: number): INT {
    this.double = value;
    return this;
  }

  setLong(value: number): INT {
    this.long = value;
    return this;
  }

  setInteger(value: number): INT {
    this.integer = value;
    return this;
  }
}
