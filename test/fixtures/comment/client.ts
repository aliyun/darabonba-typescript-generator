// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


import * as $_model from './models/model';
export * from './models/model';

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
    let modelInstance = new $_model.Test1({
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

    let _retriesAttempted = 0;
    let _lastRequest = null, _lastResponse = null;
    let _context = new $dara.RetryPolicyContext({
      retriesAttempted: _retriesAttempted,
    });
    while ($dara.shouldRetry(_runtime['retryOptions'], _context)) {
      if (_retriesAttempted > 0) {
        let _backoffTime = $dara.getBackoffDelay(_runtime['retryOptions'], _context);
        if (_backoffTime > 0) {
          await $dara.sleep(_backoffTime);
        }
      }

      _retriesAttempted = _retriesAttempted + 1;
      try {
        let request_ = new $dara.Request();
        // new model instance comment
        let modelInstance = new $_model.Test1({
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
        let response_ = await $dara.doAction(request_, _runtime);
        _lastResponse = response_;

        // static async function call
        await Client.testFunc();
        // return comment
        return ;
      } catch (ex) {
        _context = new $dara.RetryPolicyContext({
          retriesAttempted : _retriesAttempted,
          httpRequest : _lastRequest,
          httpResponse : _lastResponse,
          exception : ex,
        });
        continue;
      }
    }

    throw $dara.newUnretryableError(_context);
  }

  // testAPI2 comment
  async testAPI2(): Promise<void> {
    let _runtime: { [key: string]: any } = {
      // runtime retry comment
      retry: true,
      // runtime back comment one
      // runtime back comment two
    }

    let _retriesAttempted = 0;
    let _lastRequest = null, _lastResponse = null;
    let _context = new $dara.RetryPolicyContext({
      retriesAttempted: _retriesAttempted,
    });
    while ($dara.shouldRetry(_runtime['retryOptions'], _context)) {
      if (_retriesAttempted > 0) {
        let _backoffTime = $dara.getBackoffDelay(_runtime['retryOptions'], _context);
        if (_backoffTime > 0) {
          await $dara.sleep(_backoffTime);
        }
      }

      _retriesAttempted = _retriesAttempted + 1;
      try {
        let request_ = new $dara.Request();
        // new model instance comment
        let modelInstance = new $_model.Test3({ 
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
        let response_ = await $dara.doAction(request_, _runtime);
        _lastResponse = response_;

        // empty return comment
      } catch (ex) {
        _context = new $dara.RetryPolicyContext({
          retriesAttempted : _retriesAttempted,
          httpRequest : _lastRequest,
          httpResponse : _lastResponse,
          exception : ex,
        });
        continue;
      }
    }

    throw $dara.newUnretryableError(_context);
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
