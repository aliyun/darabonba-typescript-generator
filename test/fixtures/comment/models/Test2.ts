// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


/**
 * @remarks
 * TestModel2
 */
export class Test2 extends $dara.Model {
  /**
   * @remarks
   * test desc
   */
  // model的test front comment
  test: string;
  /**
   * @remarks
   * test2 desc
   */
  // model的test front comment
  test2: string;
  static names(): { [key: string]: string } {
    return {
      test: 'test',
      test2: 'test2',
    };
  }

  static types(): { [key: string]: any } {
    return {
      test: 'string',
      test2: 'string',
    };
  }

  validate() {
    $dara.Model.validateRequired("test", this.test);
    $dara.Model.validateRequired("test2", this.test2);
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

