// This file is auto-generated, don't edit it
import User from './model/user';
import Util from './lib/util';
import * as $tea from '@darabonba/typescript';


export default class Client {

  constructor() {
  }

  async test3(): Promise<number> {
    let _runtime: { [key: string]: any } = {
      timeouted: "retry",
    }

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
        request_.protocol = "https";
        request_.method = "DELETE";
        request_.pathname = "/";
        request_.headers = {
          host: "test.aliyun.com",
          accept: "application/json",
        };
        request_.query = Util.getQuery();
        let response_ = await $tea.doAction(request_, _runtime);
        _lastRequest = request_;
        _lastResponse = response_;

        return response_.statusCode;
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


}
