import * as $dara from '@darabonba/typescript';


// imports
import { Model } from './model';

export class User extends $dara.Model {
  jacksontian: Model;

  toMap(): {[key: string]: any} {
    let map: {[key: string]: any} = {};
    $dara.setToMap(map, 'jacksontian', $dara.mapify(this.jacksontian));
    return map;
  }

  static from(map: {[key: string]: any}): User {
    let model = new User();
    if (!$dara.isUnset(map['jacksontian'])) {
    }
    return model;
  }

  setJacksontian(value: Model): User {
    this.jacksontian = value;
    return this;
  }
}
