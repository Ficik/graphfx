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
            fontStyle: {
                type: 'String',
                default: 'normal',
                enum: [
                    'normal',
                    'bold',
                    'italic',
                    'bold italic',
                ]
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
            },
            textAlign: {
                type: 'String',
                default: 'center',
                enum: [
                    'left',
                    'center',
                    'right',
                ]
            }
        }, {});
        this._update();
    }

    async render({font, fontSize, text, color, width, height, textAlign, fontStyle}, canvas, ctx) {
        canvas.width = width;
        canvas.height = height;
        ctx.font = `${fontStyle} ${fontSize}px ${font}`;
        ctx.fillStyle = color;
        ctx.textAlign = textAlign;
        const x = textAlign === 'center' ? canvas.width /2 :
            textAlign === 'left' ? 0 : canvas.width;
        console.log(text.split('\\n'));
        text.split('\\n').forEach((line, index) => {
            ctx.fillText(line, x, fontSize * (1 + index));
        });
        return await createImageBitmap(canvas);
    }
}