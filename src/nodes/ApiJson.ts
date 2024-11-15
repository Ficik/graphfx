import {
  NumberVar,
  StringVar,
  BooleanVar,
} from './io/AbstractIOSet';
import Node from './Node';
import _ from 'lodash';

const inputs = {
  propertyPath0: {
    type: 'String',
  } as StringVar,
  propertyPath1: {
    type: 'String',
  } as StringVar,
  propertyPath2: {
    type: 'String',
  } as StringVar,
  propertyPath3: {
    type: 'String',
  } as StringVar,
  propertyPath4: {
    type: 'String',
  } as StringVar,
  propertyPath5: {
    type: 'String',
  } as StringVar,
  propertyPath6: {
    type: 'String',
  } as StringVar,
  propertyPath7: {
    type: 'String',
  } as StringVar,
  url: {
    type: 'String',
  } as StringVar,
  payload: {
    type: 'String',
  } as StringVar,
  method: {
    type: 'String',
    default: 'GET',
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
  } as StringVar,
  throttleMs: {
    type: 'Number',
    default: 10000,
  } as NumberVar,
  compress: {
    type: 'Boolean',
    default: false,
  } as BooleanVar,
  quality: {
    type: 'Number',
    default: 95,
    min: 0,
    max: 100,
  } as NumberVar,
};

const outputs = {
  value0: {
    type: 'String',
  } as StringVar,
  value1: {
    type: 'String',
  } as StringVar,
  value2: {
    type: 'String',
  } as StringVar,
  value3: {
    type: 'String',
  } as StringVar,
  value4: {
    type: 'String',
  } as StringVar,
  value5: {
    type: 'String',
  } as StringVar,
  value6: {
    type: 'String',
  } as StringVar,
  value7: {
    type: 'String',
  } as StringVar,
};

export default class ApiJson extends Node<typeof inputs, typeof outputs> {
    private fetchDataThrottled;
    private throttleWaitMs;

    constructor(options = {}) {
      super('ApiJson', inputs, outputs);
      this.throttleWaitMs = this.in.throttleMs.value;
      this.fetchDataThrottled = _.throttle(this.fetchData, this.throttleWaitMs);
    }

    async _update() {
      const url = this.in.url.value;


      if (!url) {
        return;
      }

      if (this.throttleWaitMs !== this.in.throttleMs.value) {
        this.throttleWaitMs = this.in.throttleMs.value;
        this.fetchDataThrottled = _.throttle(this.fetchData, this.throttleWaitMs);
      }

      let data: object;
      try {
        data = await this.fetchDataThrottled();
      } catch (e) {
        console.error(e);
        await new Promise((resolve) => setTimeout(resolve, this.throttleWaitMs));
        return;
      }

      this.out.value0.value = _.get(data, this.in.propertyPath0.value);
      this.out.value1.value = _.get(data, this.in.propertyPath1.value);
      this.out.value2.value = _.get(data, this.in.propertyPath2.value);
      this.out.value3.value = _.get(data, this.in.propertyPath3.value);
      this.out.value4.value = _.get(data, this.in.propertyPath4.value);
      this.out.value5.value = _.get(data, this.in.propertyPath5.value);
      this.out.value6.value = _.get(data, this.in.propertyPath6.value);
      this.out.value7.value = _.get(data, this.in.propertyPath7.value);
    }

    async fetchData() {
      const response = await fetch(this.in.url.value, {
        method: this.in.method.value,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(this.in.payload.value ? {body: this.in.payload.value} : {}),
      });

      if (response.status >= 400) {
        throw new Error(response.statusText);
      }

      return await response.json();
    }
}
