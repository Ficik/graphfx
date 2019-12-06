import Node from '../Node';

import {
    NumberVar
} from '../io/AbstractIOSet';

const inputs = {
    x: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    y: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    z: {
        type: 'Number',
        default: 0,
    } as NumberVar,
};

const outputs = {
    x: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    y: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    z: {
        type: 'Number',
        default: 0,
    } as NumberVar,
}


export default class Numbers extends Node<typeof inputs, typeof outputs> {
    constructor() {
        super('Numbers', inputs, outputs, {});
    }

    async _update() {
        this.out.x.value = this.in.x.value;
        this.out.y.value = this.in.y.value;
        this.out.z.value = this.in.z.value;
    }

}