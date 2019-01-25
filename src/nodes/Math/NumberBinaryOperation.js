import Node from '../Node';

export default class NumberBinaryOperation extends Node {
    constructor() {
        super('NumberBinaryOperation', {
            x: {
                type: 'Number',
                default: 0,
            },
            y: {
                type: 'Number',
                default: 0,
            },
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
            }
        }, {
            result: {
                type: 'Number'
            },
        }, {});
        this.__canvas = document.createElement('canvas');
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