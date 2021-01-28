// This file is auto-generated, don't edit it
import Source, * as $Source from '@scope/module';
import Local_Source, * as $Local_Source from '@scope/localModule';
import * as $tea from '@alicloud/tea-typescript';

export class M extends $tea.Model {
  a: $Local_Source.Request;
  b: Local_Source;
  static names(): { [key: string]: string } {
    return {
      a: 'a',
      b: 'b',
    };
  }

  static types(): { [key: string]: any } {
    return {
      a: $Local_Source.Request,
      b: Local_Source,
    };
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}


export default class Client {
  _id: string[];
  _str: string;

  constructor(id: string[], str: string) {
    this._id = id;
    this._str = str;
    let source = new Local_Source();
    let request = new $Local_Source.Request({
      accesskey: "accesskey",
      region: "region",
    });
    this.test(source, request);
  }


  test(source: Local_Source, request: $Local_Source.Request): $Local_Source.Request {
    return request;
  }

  static Sample(client: Source): void {
    let runtime = new $Source.RuntimeObject({ });
    let request = new $Local_Source.Request({
      accesskey: "accesskey",
      region: "region",
    });
    client.print(runtime);
  }

}
