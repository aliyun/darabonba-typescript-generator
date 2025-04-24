// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';
import Source, * as $Source from '@scope/module';
import { Util as SourceUtil, $Util as $SourceUtil }from '@scope/module';
import { Util2 }from '@scope/module';
import * as $LocalSource from '@scope/localModule';



export default class Client {
  _id: string[];
  _str: string;

  constructor(id: string[], str: string) {
    this._id = id;
    this._str = str;
  }


  static Sample(client: Source): void {
    Util2.test1();
    let a : $SourceUtil.M = SourceUtil.test1();
    let runtime = new $Source.RuntimeObject({ });
    let request = new $LocalSource.Request({
      accesskey: "accesskey",
      region: "region",
    });
    client.print(runtime);
  }

}
