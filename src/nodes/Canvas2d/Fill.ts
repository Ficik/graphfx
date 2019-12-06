import Canvas2d from './Canvas2d';
import {
    NumberVar,
    ColorVar
  } from '../io/AbstractIOSet';

const inputs = {
    image: null,
    width: {
        type: 'Number',
        default: 100,
        min: 1,
    } as NumberVar,
    height: {
        type: 'Number',
        default: 100,
        min: 1,
    } as NumberVar,
    color: {
        type: 'Color',
        default: '#FFFFFF'
    } as ColorVar
};
const outputs = {};

export default class Fill extends Canvas2d<typeof inputs, typeof outputs> {

    constructor() {
        super('Fill', inputs, outputs);
        this._update();
    }

    async render({color, width, height}, canvas, ctx) {
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        return canvas;
    }
}