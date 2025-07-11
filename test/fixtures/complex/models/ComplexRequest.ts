// This file is auto-generated, don't edit it
import { Readable } from 'stream';
import * as $dara from '@darabonba/typescript';
import * as $Source from '@scope/name';


export class ComplexRequestHeader extends $dara.Model {
  /**
   * @remarks
   * The ID of the security group to which you want to assign the instance. Instances in the same security group can communicate with each other. The maximum number of instances that a security group can contain depends on the type of the security group. For more information, see the "Security group limits" section in [Limits](https://help.aliyun.com/document_detail/25412.html#SecurityGroupQuota).
   * 
   * >Notice:  The network type of the new instance must be the same as that of the security group specified by the `SecurityGroupId` parameter. For example, if the specified security group is of the VPC type, the new instance is also of the VPC type and you must specify `VSwitchId`.
   * 
   * If you do not use `LaunchTemplateId` or `LaunchTemplateName` to specify a launch template, you must specify SecurityGroupId. Take note of the following items:
   * 
   * *   You can set `SecurityGroupId` to specify a single security group or set `SecurityGroupIds.N` to specify one or more security groups. However, you cannot specify both `SecurityGroupId` and `SecurityGroupIds.N`.
   * *   If `NetworkInterface.N.InstanceType` is set to `Primary`, you cannot specify `SecurityGroupId` or `SecurityGroupIds.N` but can specify `NetworkInterface.N.SecurityGroupId` or `NetworkInterface.N.SecurityGroupIds.N`.
   * 
   * @example
   * The content of xxx
   * 
   * example of content
   * 
   * **check if is blank:**
   * true
   * 
   * **if can be null:**
   * true
   * 
   * **if sensitive:**
   * true
   * 
   * @deprecated
   */
  content: string;
  static names(): { [key: string]: string } {
    return {
      content: 'Content',
    };
  }

  static types(): { [key: string]: any } {
    return {
      content: 'string',
    };
  }

  validate() {
    $dara.Model.validateRequired("content", this.content);
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

export class ComplexRequestConfigs extends $dara.Model {
  key: string;
  value: string[];
  extra: { [key: string]: string };
  static names(): { [key: string]: string } {
    return {
      key: 'key',
      value: 'value',
      extra: 'extra',
    };
  }

  static types(): { [key: string]: any } {
    return {
      key: 'string',
      value: { 'type': 'array', 'itemType': 'string' },
      extra: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
    };
  }

  validate() {
    $dara.Model.validateRequired("key", this.key);
    if(Array.isArray(this.value)) {
      $dara.Model.validateArray(this.value);
    }
    $dara.Model.validateRequired("value", this.value);
    if(this.extra) {
      $dara.Model.validateMap(this.extra);
    }
    $dara.Model.validateRequired("extra", this.extra);
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

export class ComplexRequestPart extends $dara.Model {
  /**
   * @remarks
   * PartNumber
   */
  partNumber?: string;
  static names(): { [key: string]: string } {
    return {
      partNumber: 'PartNumber',
    };
  }

  static types(): { [key: string]: any } {
    return {
      partNumber: 'string',
    };
  }

  validate() {
    super.validate();
  }

  constructor(map?: { [key: string]: any }) {
    super(map);
  }
}

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

