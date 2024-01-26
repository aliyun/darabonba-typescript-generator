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
        request_.method = "GET";
        request_.pathname = "/";
        request_.headers = {
          host: "www.test.com",
        };
        let response_ = await $tea.doAction(request_, _runtime);
        _lastRequest = request_;
        _lastResponse = response_;

        return ;
      } catch (ex) {
        _context = new $tea.RetryPolicyContext({
          retriesAttempted : _retriesAttempted,
          lastRequest : _lastRequest,
          lastResponse : _lastResponse,
          exception : ex,
        });
        continue;
      }
    }

    throw $tea.newUnretryableError(_context);
  }


}
