import * as $dara from '@darabonba/typescript';


export class M extends $dara.Model {

  toMap(): {[key: string]: any} {
    let map: {[key: string]: any} = {};
    return map;
  }

  static from(map: {[key: string]: any}): M {
    let model = new M();
    return model;
  }
}
