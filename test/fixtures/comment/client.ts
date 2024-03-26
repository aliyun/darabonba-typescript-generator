// This file is auto-generated, don't edit it
// top comment
/**
 * @remarks
 * top annotation
 */
// import comment
import Source from '@scope/module';
import * as $tea from '@alicloud/tea-typescript';

/**
 * @remarks
 * TestModel
 */
export class Test1 extends $tea.Model {
  /**
   * @remarks
   * test desc
   */
  test: string;
  //model的test back comment
  /**
   * @remarks
   * test2 desc
   */
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

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

/**
 * @remarks
 * TestModel2
 */
export class Test2 extends $tea.Model {
  // model的test front comment
  /**
   * @remarks
   * test desc
   */
  test: string;
  // model的test front comment
  /**
   * @remarks
   * test2 desc
   */
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

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

/**
 * @remarks
 * TestModel3
 */
export class Test3 extends $tea.Model {
  // empty comment1
  // empy comment2
  static names(): { [key: string]: string } {
    return {
    };
  }

  static types(): { [key: string]: any } {
    return {
    };
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}


export default class Client {
  // type's comment
  _a: string[];

  /**
   * @remarks
   * Init Func
   */
  // comment between init and annotation
  constructor() {
    // string declate comment
    let str = "sss";
    // new model instance comment
    let modelInstance = new Test1({
      test: "test",
      //test declare back comment
      test2: "test2",
      //test2 declare back comment
    });
    let array = [
      // array string comment
      "string",
      // array number comment
      300
      // array back comment
    ];
  }

  /**
   * @remarks
   * testAPI
   */
  //testAPI comment one
  //testAPI comment two
  async testAPI(): Promise<void> {
    let _runtime: { [key: string]: any } = { 
      // empty runtime comment
      // another runtime comment
    }

    let _lastRequest = null;
    let _now = Date.now();
    let _retryTimes = 0;
    while ($tea.allowRetry(_runtime['retry'], _retryTimes, _now)) {
      if (_retryTimes > 0) {
        let _backoffTime = $tea.getBackoffTime(_runtime['backoff'], _retryTimes);
        if (_backoffTime > 0) {
          await $tea.sleep(_backoffTime);
        }
      }

      _retryTimes = _retryTimes + 1;
      try {
        let request_ = new $tea.Request();
        // new model instance comment
        let modelInstance = new Test1({
          // test declare front comment
          test: "test",
          // test2 declare front comment
          test2: "test2",
        });
        // number declare comment
        let num = 123;
        // static function call comment
        Client.staticFunc();
        _lastRequest = request_;
        let response_ = await $tea.doAction(request_, _runtime);

        // static async function call
        await Client.testFunc();
        // return comment
        return ;
      } catch (ex) {
        if ($tea.isRetryable(ex)) {
          continue;
        }
        throw ex;
      }
    }

    throw $tea.newUnretryableError(_lastRequest);
  }

  // testAPI2 comment
  async testAPI2(): Promise<void> {
    let _runtime: { [key: string]: any } = {
      // runtime retry comment
      retry: true,
      // runtime back comment one
      // runtime back comment two
    }

    let _lastRequest = null;
    let _now = Date.now();
    let _retryTimes = 0;
    while ($tea.allowRetry(_runtime['retry'], _retryTimes, _now)) {
      if (_retryTimes > 0) {
        let _backoffTime = $tea.getBackoffTime(_runtime['backoff'], _retryTimes);
        if (_backoffTime > 0) {
          await $tea.sleep(_backoffTime);
        }
      }

      _retryTimes = _retryTimes + 1;
      try {
        let request_ = new $tea.Request();
        // new model instance comment
        let modelInstance = new Test3({ 
          //empty model 
        });
        // boolean declare comment
        let bool = true;
        if (bool) {
          //empty if
        } else {
          //empty else
        }

        // api function call comment
        await this.testAPI();
        // back comment
        _lastRequest = request_;
        let response_ = await $tea.doAction(request_, _runtime);

        // empty return comment
      } catch (ex) {
        if ($tea.isRetryable(ex)) {
          continue;
        }
        throw ex;
      }
    }

    throw $tea.newUnretryableError(_lastRequest);
  }

  static staticFunc(): void {
    let a = [ 
      // empty annotation comment
    ];
  }

  /**
   * @remarks
   * testFunc
   */
  static async testFunc(): Promise<void> {
    // empty comment1
    // empty comment2
  }

}
