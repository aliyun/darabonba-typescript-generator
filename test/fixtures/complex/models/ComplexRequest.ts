// This file is auto-generated, don't edit it
import { Readable } from 'stream';
import * as $dara from '@darabonba/typescript';
import { ComplexRequestHeader } from "./ComplexRequestHeader";
import { ComplexRequestConfigs } from "./ComplexRequestConfigs";
import { ComplexRequestPart } from "./ComplexRequestPart";
import * as $Source from '@scope/name';


export class ComplexRequest extends $dara.Model {
  accessKey: string;
  /**
   * @remarks
   * Body
   * 
   * @example
   * Body
   */
  body: Readable;
  /**
   * @remarks
   * Strs
   * 
   * @example
   * Strs
   * 
   * **check if is blank:**
   * false
   * 
   * **if can be null:**
   * false
   * 
   * **if sensitive:**
   * false
   */
  strs: string[];
  /**
   * @remarks
   * header
   */
  header: ComplexRequestHeader;
  Num: number;
  configs: ComplexRequestConfigs;
  sourceConfig: $Source.Config;
  /**
   * @remarks
   * Part
   */
  part?: ComplexRequestPart[];
  static names(): { [key: string]: string } {
    return {
      accessKey: 'accessKey',
      body: 'Body',
      strs: 'Strs',
      header: 'header',
      Num: 'Num',
      configs: 'configs',
      sourceConfig: 'sourceConfig',
      part: 'Part',
    };
  }

  static types(): { [key: string]: any } {
    return {
      accessKey: 'string',
      body: 'Readable',
      strs: { 'type': 'array', 'itemType': 'string' },
      header: ComplexRequestHeader,
      Num: 'number',
      configs: ComplexRequestConfigs,
      sourceConfig: $Source.Config,
      part: { 'type': 'array', 'itemType': ComplexRequestPart },
    };
  }

  validate() {
    $dara.Model.validateRequired("accessKey", this.accessKey);
    $dara.Model.validateRequired("body", this.body);
    if(Array.isArray(this.strs)) {
      $dara.Model.validateArray(this.strs);
    }
    $dara.Model.validateRequired("strs", this.strs);
    if(this.header && typeof (this.header as any).validate === 'function') {
      (this.header as any).validate();
    }
    $dara.Model.validateRequired("header", this.header);
    $dara.Model.validateRequired("Num", this.Num);
    if(this.configs && typeof (this.configs as any).validate === 'function') {
      (this.configs as any).validate();
    }
    $dara.Model.validateRequired("configs", this.configs);
    if(this.sourceConfig && typeof (this.sourceConfig as any).validate === 'function') {
      (this.sourceConfig as any).validate();
    }
    $dara.Model.validateRequired("sourceConfig", this.sourceConfig);
    if(Array.isArray(this.part)) {
      $dara.Model.validateArray(this.part);
    }
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

