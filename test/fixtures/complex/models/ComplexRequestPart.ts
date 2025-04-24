// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


export class ComplexRequestPart extends $dara.Model {
  /**
   * @remarks
   * PartNumber
   */
  partNumber?: string;
  static names(): { [key: string]: string } {
    return {
      partNumber: 'PartNumber',
    };
  }

  static types(): { [key: string]: any } {
    return {
      partNumber: 'string',
    };
  }

  validate() {
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

