import Canvas2d from './Canvas2d';
import {waitForMedia} from '../../utils';
import {createCanvas, mediaSize, paintToCanvas} from '../canvas';

export default class Resize extends Canvas2d {

    constructor() {
        super('Text', {
            image: null,
            text: {
                type: 'String',
                default: '',
            },
            fontSize: {
                type: 'Number',
                min: 1,
                default: 50,
            },
            font: {
                type: 'String',
                default: 'Arial',
            },
            width: {
                type: 'Number',
                default: 100,
                min: 1,
            },
            height: {
                type: 'Number',
                default: 100,
                min: 1,
            },
            color: {
                type: 'Color',
                default: '#FFFFFF'
            }
        }, {});
    }

    async render({font, fontSize, text, color, width, height}, canvas, ctx) {
        canvas.width = width;
        canvas.height = height;
        ctx.font = `${fontSize}px ${font}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width/2, canvas.height/2);
        this.__out.image.value = await createImageBitmap(canvas);
    }
}