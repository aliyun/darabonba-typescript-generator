// This file is auto-generated, don't edit it
/**
 top annotation
*/
import * as $tea from '@alicloud/tea-typescript';

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
        _lastRequest = request_;
        let response_ = await $tea.doAction(request_, _runtime);

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

  /**
    testFunc
  */
  static async testFunc(): Promise<void> {
  }

}
