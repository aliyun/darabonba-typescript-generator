import * as $dara from '@darabonba/typescript';


/**
 * @remarks
 * top annotation
 */
/**
 * @remarks
 * TestModel
 */
export class Test extends $dara.Model {
  /**
   * @remarks
   * Alichange app id 
   */
  test: string;
  static names(): { [key: string]: string } {
    return {
      test: 'test',
    };
  }

  static types(): { [key: string]: any } {
    return {
      test: 'string',
    };
  }

  validate() {
    $dara.Model.validateRequired("test", this.test);
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

