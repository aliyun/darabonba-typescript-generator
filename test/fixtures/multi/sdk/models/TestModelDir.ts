// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';
import * as $User from './model/user';


export class TestModelDir extends $dara.Model {
  test: number;
  m: $User.Info;
  static names(): { [key: string]: string } {
    return {
      test: 'test',
      m: 'm',
    };
  }

  static types(): { [key: string]: any } {
    return {
      test: 'number',
      m: $User.Info,
    };
  }

  validate() {
    $dara.Model.validateRequired("test", this.test);
    if(this.m && typeof (this.m as any).validate === 'function') {
      (this.m as any).validate();
    }
    $dara.Model.validateRequired("m", this.m);
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

export class TestModelDIR extends $dara.Model {
  test: string;
  a: any;
  static names(): { [key: string]: string } {
    return {
      test: 'test',
      a: 'a',
    };
  }

  static types(): { [key: string]: any } {
    return {
      test: 'string',
      a: 'any',
    };
  }

  validate() {
    $dara.Model.validateRequired("test", this.test);
    $dara.Model.validateRequired("a", this.a);
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

