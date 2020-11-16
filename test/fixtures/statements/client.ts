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
    if (true) {
      request_.headers["host"] = "www.test2.com";
    }

    let response_ = await $tea.doAction(request_);

    if (true) {
      throw $tea.newRetryError(request_, response_);
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
    throw $tea.newError({ });
  }

  static helloForBreak(): void {

    for (let item of [ ]) {
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
    hello = "\"hehe\"";
  }

}
