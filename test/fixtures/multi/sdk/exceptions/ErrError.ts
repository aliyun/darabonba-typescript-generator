// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


export class ErrError extends $dara.BaseError {
  test: string;

  constructor(map?: { [key: string]: any }) {
    super(map);
    this.name = "ErrError";
    Object.setPrototypeOf(this, ErrError.prototype);
    this.test = map.test;
  }
}

export class ERRError extends $dara.BaseError {
  test: number;

  constructor(map?: { [key: string]: any }) {
    super(map);
    this.name = "ERRError";
    Object.setPrototypeOf(this, ERRError.prototype);
    this.test = map.test;
  }
}

