// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


export class Err2Error extends $dara.BaseError {
  accessErrMessage: string;

  constructor(map?: { [key: string]: any }) {
    super(map);
    this.name = "Err2Error";
    Object.setPrototypeOf(this, Err2Error.prototype);
    this.accessErrMessage = map.accessErrMessage;
  }
}

