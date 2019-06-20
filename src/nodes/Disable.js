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
        }, {});
    }

    async _update() {
      if (!this.in.disabled.value) {
        this.out.image.value = this.in.image.value;
      }
    }

}