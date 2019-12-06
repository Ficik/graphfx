import Node from '../Node';
import {
    NumberVar,
    StringVar,
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
    operation: {
        type: 'String',
        default: '+',
        enum: [
            '+',
            '-',
            '⨉',
            '÷',
            'mod',
            'max',
            'min',
        ]
    } as StringVar
};

const outputs = {
    result: {
        type: 'Number'
    } as NumberVar,
}

export default class NumberBinaryOperation extends Node<typeof inputs, typeof outputs> {
    constructor() {
        super('NumberBinaryOperation', inputs, outputs, {});
    }

    async _update() {
        const x = this.in.x.value;
        const y = this.in.y.value;
        const op = this.in.operation.value;
        const value =
            op === '+' ? x + y :
            op === '-' ? x - y :
            op === '⨉' ? x * y :
            op === '÷' ?
                y === 0 ? NaN :
                x / y :
            op === 'mod' ?  x % y :
            op === 'max' ? Math.max(x, y) :
            op === 'min' ? Math.min(x, y) :
            NaN;

        if (!isNaN(value)) {
            this.out.result.value = value;
        }
    }

}