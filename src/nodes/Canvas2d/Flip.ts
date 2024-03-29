import Canvas2d from './Canvas2d';
import {createCanvas, mediaSize, paintToCanvas} from '../canvas';
import {
    BooleanVar, ImageVar
  } from '../io/AbstractIOSet';

const inputs = {
    horizontal: {
        type: 'Boolean',
        default: false,
    } as BooleanVar,
    vertical: {
        type: 'Boolean',
        default: false,
    } as BooleanVar,
}

const outputs = {};

export default class Flip extends Canvas2d<typeof inputs, typeof outputs> {

    constructor() {
        super('Flip', inputs, outputs);
        this._update();
    }

    async render({image, horizontal, vertical}, canvas, ctx) {
        if (!image) return;
        const horizontalModifier = horizontal ? -1 : 1;
        const verticalModifier = vertical ? -1 : 1;
        const {width, height} = mediaSize(image);
        canvas.width = width;
        canvas.height = height;
        ctx.save();
        ctx.scale(horizontalModifier, verticalModifier);
        ctx.drawImage(image, 0, 0, width * horizontalModifier, height * verticalModifier);
        ctx.restore();
        return canvas;
    }
}