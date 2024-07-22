/**
 * @remarks
 * top annotation
 */
import * as $tea from '@alicloud/tea-typescript';

/**
 * @remarks
 * TestModel
 */
export class Test extends $tea.Model {
  /**
   * @remarks
   * Alichange app id 
   */
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
