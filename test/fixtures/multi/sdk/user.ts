// This file is auto-generated, don't edit it
import DARAUtil from '@alicloud/tea-util';
import Util from '../lib/util';
import * as $dara from '@darabonba/typescript';

export class Info extends $dara.Model {
  name: string;
  age: number;
  static names(): { [key: string]: string } {
    return {
      name: 'name',
      age: 'age',
    };
  }

  static types(): { [key: string]: any } {
    return {
      name: 'string',
      age: 'number',
    };
  }
  validate() {
      $dara.Model.validateRequired("name", this.name);
      $dara.Model.validateRequired("age", this.age);
  };

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}


export default class Client {

  static async *test(): AsyncGenerator<string, any, unknown> {
    let it = Util.test1();

    for(let test of it) {
      yield test;
    }
  }

}
