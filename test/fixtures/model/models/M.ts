// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


export class MSubM extends $dara.Model {
  static names(): { [key: string]: string } {
    return {
    };
  }

  static types(): { [key: string]: any } {
    return {
    };
  }

  validate() {
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

export class M extends $dara.Model {
  subM: MSubM;
  self: M;
  static names(): { [key: string]: string } {
    return {
      subM: 'subM',
      self: 'self',
    };
  }

  static types(): { [key: string]: any } {
    return {
      subM: MSubM,
      self: M,
    };
  }

  validate() {
    if(this.subM && typeof (this.subM as any).validate === 'function') {
      (this.subM as any).validate();
    }
    $dara.Model.validateRequired("subM", this.subM);
    if(this.self && typeof (this.self as any).validate === 'function') {
      (this.self as any).validate();
    }
    $dara.Model.validateRequired("self", this.self);
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

