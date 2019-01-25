import Node from '../Node';

export default class Numbers extends Node {
    constructor() {
        super('Numbers', {
            x: {
                type: 'Number',
                default: 0,
            },
            y: {
                type: 'Number',
                default: 0,
            },
            z: {
                type: 'Number',
                default: 0,
            },
        }, {
            x: {
                type: 'Number',
                default: 0,
            },
            y: {
                type: 'Number',
                default: 0,
            },
            z: {
                type: 'Number',
                default: 0,
            },
        }, {});
        this.__canvas = document.createElement('canvas');
    }

    async _update() {
        this.out.x.value = this.in.x.value;
        this.out.y.value = this.in.y.value;
        this.out.z.value = this.in.z.value;
    }

}