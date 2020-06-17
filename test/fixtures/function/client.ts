// This file is auto-generated, don't edit it
import * as $tea from '@alicloud/tea-typescript';


export default class Client {

  static hello(): void {
    return ;
  }

  static helloMap(): {[key: string ]: string} {
    let m : {[key: string ]: string} = { };
    return {
      key: "value",
      'key-1': "value-1",
      ...m,
    };
  }

  static helloArrayMap(): {[key: string ]: string}[] {
    return [
      {
        key: "value",
      }
    ];
  }

  static async helloParams(a: string, b: string): Promise<void> {
  }

  // interface mode
  static async helloInterface(): Promise<void> {
    throw new Error('Un-implemented!');
  }

}
