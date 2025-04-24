// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


// top comment
/**
 * @remarks
 * top annotation
 */
// import comment
/**
 * @remarks
 * TestModel
 */
export class Test1 extends $dara.Model {
  /**
   * @remarks
   * test desc
   */
  test: string;
  /**
   * @remarks
   * test2 desc
   */
  //model的test back comment
  test2: string;
  //model的test2 back comment
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

