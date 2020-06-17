// This file is auto-generated, don't edit it
import * as $tea from '@alicloud/tea-typescript';


export default class Client {

  constructor() {
  }

  async hello(): Promise<void> {
    let request_ = new $tea.Request();
    request_.method = "GET";
    request_.pathname = "/";
    request_.headers = {
      host: "www.test.com",
    };
    let response_ = await $tea.doAction(request_);

    return ;
  }

  async helloRuntime(): Promise<void> {
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
        request_.method = "GET";
        request_.pathname = "/";
        request_.headers = {
          host: "www.test.com",
        };
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


}
