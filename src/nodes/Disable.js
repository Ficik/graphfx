import Node from './Node';

export default class Disable extends Node {
    constructor() {
        super('Disable', {
          image: {
            type: 'Image',
          },
          disabled: {
            type: 'Boolean',
            default: false,
          },
        }, {
          image: {
            type: 'Image',
          },
          width: {
            type: 'Number',
          },
          height: {
            type: 'Number',
          },
        }, {});
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