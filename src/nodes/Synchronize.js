// @ts-nocheck
import Node from './Node';

export default class Numbers extends Node {
    constructor() {
        super('Synchronize', {
            first: {
                type: 'Image',
                default: 0,
            },
            second: {
                type: 'Image',
                default: 0,
            },
        }, {
          first: {
            type: 'Image',
            default: 0,
          },
          second: {
              type: 'Image',
              default: 0,
          },
        }, {});
        this.__changed = {
          first: false,
          second: false,
        };
        this.in.first.onchange((value) => {
          if (value) {
            console.log('first hit', value)
            this.__changed.first = true;
          }
        });
        this.in.second.onchange((value) => {
          if (value) {
            console.log('second hit', value)
            this.__changed.second = true;
          }
        });
    }

    async _update() {
      const {first, second} = this.__changed;
      if (first && second) {
        console.log('synced')
        this.out.first.value = this.in.first.value;
        this.out.second.value = this.in.second.value;
        this.__changed = {
          first: false,
          second: false,
        };
      } else {
        console.log('not synced')
      }
    }

}