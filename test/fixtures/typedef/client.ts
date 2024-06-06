// This file is auto-generated, don't edit it
import OSS, * as $OSS from '@scope/name';
import * as $dara from '@darabonba/typescript';
import * as http from 'http';

export class M extends $dara.Model {
  a?: http.ClientRequest;
  b?: string;
  c?: $dara.Model;
  static names(): { [key: string]: string } {
    return {
      a: 'a',
      b: 'b',
      c: 'c',
    };
  }

  static types(): { [key: string]: any } {
    return {
      a: http.ClientRequest,
      b: 'string',
      c: $dara.Model,
    };
  }

  validate() {
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}


export default class Client {
  _vid: http.ClientRequest;
  _url: string;

  constructor(request: http.ClientRequest, url: string) {
    this._vid = request;
    this._url = url;
  }


  async main(test1: http.ClientRequest, test2: string): Promise<void> {
    let oss = new OSS(test1);
    let m = new M({
      a: test1,
      b: test2,
    });
    this._vid = test1;
    this._url = test2;
  }

  async testHttpRequest(req: http.ClientRequest): Promise<http.IncomingMessage> {
    return Client.testHttpRequestWith("test", req);
  }

  static testHttpRequestWith(method: string, req: http.ClientRequest): http.IncomingMessage {
    throw new Error('Un-implemented!');
  }

  static testHttpHeader(method: string, headers: http.OutgoingHttpHeaders): http.ClientRequest {
    throw new Error('Un-implemented!');
  }

  async testHttpHeaderWith(headers: http.OutgoingHttpHeaders): Promise<http.ClientRequest> {
    return Client.testHttpHeader("test", headers);
  }

}
