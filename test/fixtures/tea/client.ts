// This file is auto-generated, don't edit it
import Source, * as $Source from '@scope/module';
import Util, * as $Util from '@scope/module/src/util';
import LocalSource, * as $LocalSource from '@scope/localModule';
import * as $dara from '@darabonba/typescript';


export default class Client {
  _id: string[];
  _str: string;

  constructor(id: string[], str: string) {
    this._id = id;
    this._str = str;
  }


  static Sample(client: Source): void {
    let a : $Util.M = Util.test1();
    let runtime = new $Source.RuntimeObject({ });
    let request = new $LocalSource.Request({
      accesskey: "accesskey",
      region: "region",
    });
    client.print(runtime);
  }

}
