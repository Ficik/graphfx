import Node from './Node';
import {
    ImageVar,
    NumberVar,
    StringVar,
    BooleanVar,
} from './io/AbstractIOSet';
import _ from 'lodash';

const inputs = {
    image: {
        type: 'Image',
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
    i8: {
        type: 'String',
        default: undefined,
    } as StringVar,
    i9: {
        type: 'String',
        default: undefined,
    } as StringVar,
    i10: {
        type: 'String',
        default: undefined,
    } as StringVar,
    i11: {
        type: 'String',
        default: undefined,
    } as StringVar,
    i12: {
        type: 'String',
        default: undefined,
    } as StringVar,
    i13: {
        type: 'String',
        default: undefined,
    } as StringVar,
    i14: {
        type: 'String',
        default: undefined,
    } as StringVar,
    i15: {
        type: 'String',
        default: undefined,
    } as StringVar,
    formula: {
        type: 'String',
        default: '',
    } as StringVar,
    waitForInput: {
        type: 'Boolean',
        default: true,
    } as BooleanVar,
};

const outputs = {
    image: {
        type: 'Image',
    } as ImageVar,
    result: {
        type: 'Number',
    } as NumberVar,
    resultString: {
        type: 'String',
    } as StringVar,
};

export default class Eval extends Node<typeof inputs, typeof outputs> {
    constructor() {
        super('Eval', inputs, outputs);
    }

    interpolate(defaultValue: any) {
        return this.in.formula.value.replace(/\{((i\d)+)}/g, (originalString, paramName) => {
            return _.get(this.in, [paramName, 'value'], defaultValue);
        });
    }

    hasAllConnectedInputsValue() {
        if (!this.in.waitForInput.value) {
            return true;
        }

        for (const inputName of Object.keys(this.in.variables)) {
            // allow empty string
            if (this.in[inputName].output && !this.in[inputName].value && !_.isString(this.in[inputName].value)) {
                return false;
            }
        }
        return true;
    }

    evaluate() {
        try {
            this.out.result.value = eval(this.interpolate(0));
            this.out.resultString.value = eval(this.interpolate(''));
        } catch (e) {
            console.error(e, this.in);
        }
        this.out.image.value = this.in.image.value;
    }

    async _update() {
        return this.evaluate();
    }

}