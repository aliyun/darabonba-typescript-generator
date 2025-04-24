// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


export class MyModelSubmodel extends $dara.Model {
  stringfield: string;
  static names(): { [key: string]: string } {
    return {
      stringfield: 'stringfield',
    };
  }

  static types(): { [key: string]: any } {
    return {
      stringfield: 'string',
    };
  }

  validate() {
    $dara.Model.validateRequired("stringfield", this.stringfield);
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

