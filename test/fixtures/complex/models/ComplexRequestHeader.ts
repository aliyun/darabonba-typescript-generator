// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


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

