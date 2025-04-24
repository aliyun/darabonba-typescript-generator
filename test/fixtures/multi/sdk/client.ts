// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';
import * as $User from './model/user';
import Util from './lib/util';
import API from './api';
import Overwrite from './overwrite';


export * as $Api from './api';
export { default as Api } from './api';
export * as $User from './model/user';
export { default as User } from './model/user';

import * as $_error from './exceptions/error';
export * from './exceptions/error';
import * as $_model from './models/model';
export * from './models/model';

export default class Client {
  _user: $User.Info;

  constructor() {
    Overwrite.test();
    this._user = new $User.Info({
      name: "test",
    });
  }


  async *test3(): AsyncGenerator<string, any, unknown> {
    let it = Util.test1();

    for(let test of it) {
      yield test;
    }
  }

  async test4(): Promise<number> {
    let api = new API();
    let status = await api.test3();
    return status;
  }

}
