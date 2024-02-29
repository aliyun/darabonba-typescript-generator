// This file is auto-generated, don't edit it
/**
 top annotation
*/
import * as $tea from '@darabonba/typescript';

/**
  TestModel
*/
export class Test extends $tea.Model {
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
    let _context = new $tea.RetryPolicyContext({
      retriesAttempted: _retriesAttempted,
    });
    while ($tea.shouldRetry(_runtime['retryOptions'], _context)) {
      if (_retriesAttempted > 0) {
        let _backoffTime = $tea.getBackoffDelay(_runtime['retryOptions'], _context);
        if (_backoffTime > 0) {
          await $tea.sleep(_backoffTime);
        }
      }

      _retriesAttempted = _retriesAttempted + 1;
      try {
        let request_ = new $tea.Request();
        let response_ = await $tea.doAction(request_, _runtime);
        _lastRequest = request_;
        _lastResponse = response_;

        return ;
      } catch (ex) {
        _context = new $tea.RetryPolicyContext({
          retriesAttempted : _retriesAttempted,
          httpRequest : _lastRequest,
          httpResponse : _lastResponse,
          exception : ex,
        });
        continue;
      }
    }

    throw $tea.newUnretryableError(_context);
  }

  /**
    testFunc
  */
  static async testFunc(): Promise<void> {
  }

}
