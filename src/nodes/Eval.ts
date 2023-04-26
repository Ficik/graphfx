import Node from './Node';
import {
    NumberVar,
    StringVar,
} from './io/AbstractIOSet';
import get from 'lodash/get';

const inputs = {
    i0: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    i1: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    i2: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    i3: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    i4: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    i5: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    i6: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    i7: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    formula: {
        type: 'String',
        default: '',
    } as StringVar
};

const outputs = {
    result: {
        type: 'Number'
    } as NumberVar,
}

export default class NumberBinaryOperation extends Node<typeof inputs, typeof outputs> {
    constructor() {
        super('Eval', inputs, outputs);
    }

    interpolate() {
        return this.in.formula.value.replace(/\{(\w+)\}/g, (_, paramName) =>
            get(this.in, [paramName, 'value'], 0)
        )
    }

    evaluate() {
        try {
            this.out.result.value = eval(this.interpolate());
        } catch (e) {
            console.error(e);
        }
    }

    async _update() {
        return this.evaluate();
    }

}