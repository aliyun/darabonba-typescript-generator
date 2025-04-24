// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


export class Err1Error extends $dara.BaseError {
  message: string;
  data: { [key: string]: string };

  constructor(map?: { [key: string]: any }) {
    super(map);
    this.name = "Err1Error";
    Object.setPrototypeOf(this, Err1Error.prototype);
    this.data = map.data;
  }
}

