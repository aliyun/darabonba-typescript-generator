// This file is auto-generated, don't edit it
import DARAUtil from '@alicloud/tea-util';
import Util from '../lib/util';
import * as $tea from '@alicloud/tea-typescript';

export class Info extends $tea.Model {
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

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}


export default class Client {

  static async *test(){
    let it = await Util.test1();

    for(let test of it) {
      yield test;
    }
  }

}
