// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


export default class Client {

  constructor() {
  }

  async hello(): Promise<void> {
    let request_ = new $dara.Request();
    request_.method = "GET";
    request_.pathname = "/";
    request_.headers = {
      host: "www.test.com",
    };
    let response_ = await $dara.doAction(request_);

    return ;
  }

  async helloRuntime(): Promise<void> {
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
        request_.method = "GET";
        request_.pathname = "/";
        request_.headers = {
          host: "www.test.com",
        };
        let response_ = await $dara.doAction(request_, _runtime);
        _lastRequest = request_;
        _lastResponse = response_;

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


}
