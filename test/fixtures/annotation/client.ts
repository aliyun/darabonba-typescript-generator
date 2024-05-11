// This file is auto-generated, don't edit it
/**
 top annotation
*/
import * as $dara from '@darabonba/typescript';

/**
  TestModel
*/
export class Test extends $dara.Model {
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
  };

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}


export default class Client {
  _a: string;

  /**
    Init Func
  */
  constructor() {
  }

  /**
    testAPI
  */
  async testAPI(): Promise<void> {
    let _runtime: { [key: string]: any } = { }

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
        let response_ = await $dara.doAction(request_, _runtime);
        _lastRequest = request_;
        _lastResponse = response_;

        return ;
      } catch (ex) {
        _context = new $dara.RetryPolicyContext({
          retriesAttempted : _retriesAttempted,
          lastRequest : _lastRequest,
          lastResponse : _lastResponse,
          exception : ex,
        });
        continue;
      }
    }

    throw $dara.newUnretryableError(_context);
  }

  /**
    testFunc
  */
  static async testFunc(): Promise<void> {
  }

}
