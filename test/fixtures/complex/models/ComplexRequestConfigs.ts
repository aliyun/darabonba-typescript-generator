// This file is auto-generated, don't edit it
import * as $dara from '@darabonba/typescript';


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

