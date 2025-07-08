import * as $dara from '@darabonba/typescript';


import * as $_model from './models/model';
export * from './models/model';

export default class Client {
  _a: string;

  /**
   * @remarks
   * Init Func
   */
  constructor() {
  }

  /**
   * @remarks
   * testAPI
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
        _lastRequest = request_;
        let response_ = await $dara.doAction(request_, _runtime);
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

  /**
   * @remarks
   * testFunc
   */
  static async testFunc(): Promise<void> {
  }

  /**
   * annotation test summary
   * 
   * @remarks
   * annotation test description
   * * description1 test for typescript
   * * description2 test for typescript
   * * test link: [Limits](https://help.aliyun.com/document_detail/25412.html#SecurityGroupQuota).
   * 
   * @param test - string param1
   * @param _test - string param2
   * @returns void
   * 
   * @throws InternalError Server error. 500 服务器端出现未知异常。
   * @throws StackNotFound The Stack (%(stack_name)s) could not be found.  404 资源栈不存在。
   */
  static async testFuncWithAnnotation(test: string, _test: string): Promise<void> {
    // empty comment1
    // empty comment2
  }

  /**
   * annotation test summary
   * 
   * @deprecated annotation test deprecation
   * 
   * @param test - string param1
   * @param _test - string param2
   * @returns void
   * 
   * @throws InternalError Server error. 500 服务器端出现未知异常。
   * @throws StackNotFound The Stack (%(stack_name)s) could not be found.  404 资源栈不存在。
   */
  static async testFuncWithAnnotation1(test: string, _test: string): Promise<void> {
    // empty comment1
    // empty comment2
  }

  /**
   * annotation test summary
   * 
   * @deprecated annotation test deprecation
   * deprecated description1
   * 
   * @param test - string param1
   * param description1
   * @param _test - string param2
   * param description2
   * @returns void
   * return description1
   * 
   * @throws InternalError Server error. 500 服务器端出现未知异常。
   * throws description1
   * @throws StackNotFound The Stack (%(stack_name)s) could not be found.  404 资源栈不存在。
   */
  static async testLineBreakAnnotation(test: string, _test: string): Promise<void> {
    // empty comment1
    // empty comment2
  }

}
