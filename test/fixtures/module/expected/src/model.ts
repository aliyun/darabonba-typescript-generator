import * as $dara from '@darabonba/typescript';


export class Model extends $dara.Model {
  name: string;

  toMap(): {[key: string]: any} {
    let map: {[key: string]: any} = {};
    $dara.setToMap(map, 'name', $dara.mapify(this.name));
    return map;
  }

  static from(map: {[key: string]: any}): Model {
    let model = new Model();
    if (!$dara.isUnset(map['name'])) {
      model.name = map['name'];
    }
    return model;
  }

  setName(value: string): Model {
    this.name = value;
    return this;
  }
}
