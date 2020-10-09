// This file is auto-generated, don't edit it

import * as $dara from '@darabonba/typescript';


import * as fs from 'fs';

// imports
import { Parent } from './parent';
import { MyInterface } from './interface';
import { MyInterface2 } from './interface2';
import { Model } from './model';
import { User } from './user';

/**
 * Module annotation
 */
export class Module extends Parent implements MyInterface, MyInterface2 {
  _key: string;

  /**
   * init annotation
   */
  constructor() {
    super();
  }

  /**
   * function annotation
   */
  test(name: string): void {
  }

  static staticFunction(): void {
  }

  async asyncFunction(): Promise<void> {
  }

  bindingMethod(name: string): void {
    return ;
  }

  stmts(): void {
    if (true) {
    } else if (true) {
    } else {
    }

    let name : string = "JacksonTian";
    name = "Hello";

    while (true) {
    }

    for (; ; ) {
      break;
    }

    for (let item of []) {
      break;
    }

    try {
      throw $dara.newError({});
    } catch (ex) {
    } finally {
    }

    return ;
  }

  booleanExpr(): boolean {
    return true;
  }

  stringExpr(): string {
    return "string";
  }

  numberExpr(): number {
    return 1;
  }

  nullExpr(): number {
    return null;
  }

  templateString(name: string): string {
    return `hello ${name}!`;
  }

  async af(a1: string, a2: string): Promise<void> {
  }

  static sf(): void {
  }

  static async saf(): Promise<void> {
  }

  async call(): Promise<void> {
    this.templateString("world");
    await this.af("a1", "a2");
    Module.sf();
    await Module.saf();
  }

  chain(): Module {
    return new Module();
  }

  logical(): void {
    true && false;
    true || false;
    !true;
  }

  binary(): void {
    1 < 2;
    1 > 1;
    1 <= 2;
    2 >= 3;
  }

  array(): string[] {
    return [
      "1",
      "2"
    ];
  }

  mapExpr(): {[key: string]: string} {
    let m = {
      'key2': "value2"
    };
    return {
      'key': "value",
      ...m
    };
  }

  memberExpr(): void {
    let m = {
      'key2': "value2"
    };
    m["key3"] = "value";
    m["key3"];
    let a = [
      1
    ];
    a[0];
  }

  modelExpr(): void {
    new Model();
    let m = new Model()
      .setName("JacksonTian");
    m.name;
    let u = new User();
    u.jacksontian.name;
  }

  assignExpr(): void {
    for (let item : string of []) {
    }

    for (let i = 0; i < 10; i = 0) {
    }
  }

  toExpr(): Model {
    return Model.from({});
  }

  inlineExpr(): void {
    $dara.push([], "string");
    [].length;
  }

  commentExpr(): void {
  }

  // comments
  vid(): string {
    return this._key;
  }

  reservedWord(): string {
    let function_ = "";
    return function_;
  }

}
