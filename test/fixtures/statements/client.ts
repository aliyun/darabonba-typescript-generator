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
    if (true) {
      request_.headers["host"] = "www.test2.com";
    }

    let response_ = await $dara.doAction(request_);

    if (true) {
      throw $dara.newRetryError(request_, response_);
    } else {
      true;
    }

    Client.helloIf();
    !false;
    let a : string = null;
    a = "string";
    return ;
  }

  static helloIf(): void {
    if (true) {
    }

    if (true) {
    } else if (true) {
    } else {
    }

  }

  static helloThrow(): void {
    throw $dara.newError({ });
  }

  static helloForBreak(): void {

    for(let item of [ ]) {
      break;
    }
  }

  static helloWhile(): void {

    while (true) {
      break;
    }
  }

  static helloDeclare(): void {
    let hello = "world";
    let helloNull : string = null;
    hello = "\"hehe\":\"\"";
  }

}
