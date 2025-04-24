// This file is auto-generated, don't edit it
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

