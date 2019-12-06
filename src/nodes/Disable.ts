import Node from './Node';
import {ImageVar, BooleanVar, NumberVar} from './io/AbstractIOSet';

const inputs = {
  image: {
    type: 'Image',
  } as ImageVar,
  disabled: {
    type: 'Boolean',
    default: false,
  } as BooleanVar,
};

const outputs = {
  image: {
    type: 'Image',
  } as ImageVar,
  width: {
    type: 'Number',
  } as NumberVar,
  height: {
    type: 'Number',
  } as NumberVar,
};


export default class Disable extends Node<typeof inputs, typeof outputs> {
    constructor() {
        super('Disable', inputs, outputs, {});
    }

    async _update() {
      if (!this.in.disabled.value) {
        this.out.image.value = this.in.image.value;
        if (!this.out.image.value) {
          return;
        }
        if (this.out.width.value !== this.out.image.value.width) {
          this.out.width.value = this.out.image.value.width;
        }
        if (this.out.height.value !== this.out.image.value.height) {
            this.out.height.value = this.out.image.value.height;
        }
      }
    }

}