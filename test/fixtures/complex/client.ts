// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';
import Source, * as $Source from '@scope/name';


import * as $_error from './exceptions/error';
export * from './exceptions/error';
import * as $_model from './models/model';
export * from './models/model';

export default class Client extends Source {
  _configs: $Source.Config[];

  constructor(config: $Source.Config) {
    super(config);
    this._configs[0] = config;
  }

  async complex1(request: $_model.ComplexRequest, client: Source): Promise<$Source.RuntimeObject> {
    let _runtime: { [key: string]: any } = {
      timeouted: "retry",
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
        let name = "complex";
        let mapVal = {
          test: "ok",
        };
        let moduleModelMapVal : {[key: string ]: $Source.RuntimeObject} = { };
        let moduleMapVal : {[key: string ]: Source} = { };
        let modelMapVal : {[key: string ]: $_model.ComplexRequest} = { };
        let subModelMapVal : {[key: string ]: $_model.ComplexRequestHeader} = { };
        let version = `/${"2019-01-08"}${this._pathname}`;
        let mapAccess = this._API[version];
        request_.protocol = this._protocol;
        request_.port = 80;
        request_.method = "GET";
        request_.pathname = `/${this._pathname}`;
        request_.query = Source.query({
          date: "2019",
          access: mapAccess,
          test: mapVal["test"],
          ...request.header,
        });
        request_.body = Source.body();
        _lastRequest = request_;
        let response_ = await $dara.doAction(request_, _runtime);
        _lastResponse = response_;

        if (true && true) {
          return null;
        } else if (true || false) {
          return new $Source.RuntimeObject({ });
        }

        client.print($dara.toMap(request), "1");
        await client.printAsync($dara.toMap(request), "1");
        await this.hello($dara.toMap(request), [
          "1",
          "2"
        ]);
        await this.hello(null, null);
        await this.Complex3(null);
        return $dara.cast<$Source.RuntimeObject>({ }, new $Source.RuntimeObject({}));
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

  async Complex2(request: $_model.ComplexRequest, str: string[], val: {[key: string ]: string}): Promise<{[key: string]: any}> {
    let request_ = new $dara.Request();
    let name = "complex";
    let config = new $Source.Config({ });
    let client = new Source(config);
    request_.protocol = "HTTP";
    request_.port = 80;
    request_.method = "GET";
    request_.pathname = "/";
    request_.query = Source.query({
      date: "2019",
      version: "2019-01-08",
      protocol: request_.protocol,
    });
    request_.body = Source.body();
    let response_ = await $dara.doAction(request_);

    return { };
  }

  async Complex3(request: $_model.ComplexRequest): Promise<$_model.ComplexRequest> {
    let request_ = new $dara.Request();
    let name = "complex";
    request_.protocol = await this.TemplateString();
    request_.port = 80;
    request_.method = "GET";
    request_.pathname = "/";
    request_.query = Source.query({
      date: "2019",
    });
    request_.body = Source.body();
    request_.headers["host"] = "hello";
    let response_ = await $dara.doAction(request_);

    let resp = response_;
    let req = new $Source.Request({
      accesskey: request.accessKey,
      region: resp.statusMessage,
    });
    Client.array0($dara.toMap(request));
    req.accesskey = "accesskey";
    req.accesskey = request.accessKey;
    Source.parse($_model.ComplexRequest);
    Source.array($dara.toMap(request), "1");
    await Source.asyncFunc();
    return $dara.cast<$_model.ComplexRequest>({
      ...request_.query,
    }, new $_model.ComplexRequest({}));
  }

  async hello(request: {[key: string]: any}, strs: string[]): Promise<string[]> {
    return Client.array1();
  }

  static async print(reqeust: $dara.Request, reqs: $_model.ComplexRequest[], response: $dara.Response, val: {[key: string ]: string}): Promise<$Source.Request> {
    return $dara.cast<$Source.Request>({ }, new $Source.Request({}));
  }

  static subConf(conf: $Source.RequestConfigs): $Source.RequestConfigsSubConf {
    return conf.subConf;
  }

  static array0(req: {[key: string]: any}): any[] {
    return [ ];
  }

  static array1(): string[] {
    return [
      "1"
    ];
  }

  static arrayAccess(): string {
    let configs = [
      "a",
      "b",
      "c"
    ];
    let config = configs[0];
    return config;
  }

  static arrayAccess2(): string {
    let data = {
      configs: [
        "a",
        "b",
        "c"
      ],
    };
    let config = data["configs"][0];
    return config;
  }

  static arrayAccess3(request: $_model.ComplexRequest): string {
    let configVal = request.configs.value[0];
    return configVal;
  }

  static arrayAssign(config: string): string[] {
    let configs = [
      "a",
      "b",
      "c"
    ];
    configs[3] = config;
    return configs;
  }

  static arrayAssign2(config: string): string[] {
    let data = {
      configs: [
        "a",
        "b",
        "c"
      ],
    };
    data["configs"][3] = config;
    return data["configs"];
  }

  static arrayAssign3(request: $_model.ComplexRequest, config: string): void {
    request.configs.value[0] = config;
  }

  static mapAccess(request: $_model.ComplexRequest): string {
    let configInfo = request.configs.extra["name"];
    return configInfo;
  }

  static mapAccess2(request: $Source.Request): string {
    let configInfo = request.configs.extra["name"];
    return configInfo;
  }

  static mapAccess3(): string {
    let data = {
      configs: {
        value: "string",
      },
    };
    return data["configs"]["value"];
  }

  static mapAssign(request: $_model.ComplexRequest, name: string): void {
    request.configs.extra["name"] = name;
  }

  async TemplateString(): Promise<string> {
    return `/${this._protocol}`;
  }

  intOp(a: number): void {
    a++;
    ++a;
    a--;
    --a;
  }

  async emptyModel(): Promise<void> {
    new $_model.ComplexRequest({ });
    new $_model.ComplexRequestHeader({ });
  }

  groupOp(): boolean {
    let a = "1234";
    if (!(a == "1234")) {
      return true;
    }

    if (!(a === "1234")) {
      return true;
    }

    return false;
  }

  async tryCatch(): Promise<void> {
    try {
      let str = await this.TemplateString();
    } catch (__err) {
      const err = __err;
      let error = err;
    } finally {
      let final = "ok";
    }    
    try {
      let strNoFinal = await this.TemplateString();
    } catch (__err) {
      const e = __err;
      let errorNoFinal = e;
    }    
    try {
      let strNoCatch = await this.TemplateString();
    } finally {
      let finalNoCatch = "ok";
    }    
  }

  async multiTryCatch(a: number): Promise<void> {
    try {
      if (a > 0) {
        throw new $_error.Err1Error({
          name: "str",
          code: "str",
          data: {
            key1: "str",
          },
        });
      } else if (a == 0) {
        throw new $_error.Err2Error({
          name: "str",
          code: "str",
          accessErrMessage: "str2",
        });
      } else if (a < 0) {
        throw new $Source.Err3Error({
          name: "str",
          code: "str",
          otherMessage: "str2",
        });
      } else {
        throw new $dara.BaseError({
          name: "str",
          code: "str",
        });
      }

    } catch (__err) {
      if (__err instanceof $_error.Err1Error) {
        const err = __err;
        console.log(err.name);
        return;
      }
      if (__err instanceof $_error.Err2Error) {
        const err = __err;
        console.log(err.name);
        return;
      }
      if (__err instanceof $Source.Err3Error) {
        const err = __err;
        console.log(err.name);
        return;
      }
      const err = __err;
      console.log(err.name);
    } finally {
      let final = "ok";
    }    
  }

}
