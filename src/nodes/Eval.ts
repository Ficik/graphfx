import Node from './Node';
import {
    ImageVar,
    NumberVar,
    StringVar,
    BooleanVar,
} from './io/AbstractIOSet';
import get from 'lodash/get';

const inputs = {
    image: {
        type: 'Image'
    } as ImageVar,
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
    } as StringVar,
    waitForInput: {
        type: 'Boolean',
        default: true,
    } as BooleanVar
};

const outputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    result: {
        type: 'Number'
    } as NumberVar,
}

export default class Eval extends Node<typeof inputs, typeof outputs> {
    constructor() {
        super('Eval', inputs, outputs);
    }

    interpolate() {
        return this.in.formula.value.replace(/\{(\w+)\}/g, (_, paramName) =>
            get(this.in, [paramName, 'value'], 0)
        )
    }

    hasAllConnectedInputsValue() {
        if (this.in.waitForInput.value) {
            return super.hasAllConnectedInputsValue();
        }
        return true;
    }

    evaluate() {
        try {
            this.out.result.value = eval(this.interpolate());
        } catch (e) {
            console.error(e);
        }
        this.out.image.value = this.in.image.value;
    }

    async _update() {
        return this.evaluate();
    }

}