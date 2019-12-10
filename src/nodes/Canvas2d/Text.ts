import Canvas2d from './Canvas2d';
import {waitForMedia} from '../../utils';
import {createCanvas, mediaSize, paintToCanvas} from '../canvas';
import {
    NumberVar,
    StringVar,
    FontVar,
    ColorVar,
} from '../io/AbstractIOSet';

const isEmpty = (x) => !x || Object.keys(x).length === 0;

const inputs = {
    image: null,
    text: {
        type: 'String',
        default: '',
    } as StringVar,
    fontSize: {
        type: 'Number',
        min: 1,
        default: 50,
    } as NumberVar,
    fontStyle: {
        type: 'String',
        default: 'normal',
        enum: [
            'normal',
            'bold',
            'italic',
            'bold italic',
        ]
    } as StringVar,
    font: {
        type: 'Font', // {name, url, fontface}
        default: 'Arial',
    } as FontVar,
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
    } as ColorVar,
    textAlign: {
        type: 'String',
        default: 'center',
        enum: [
            'left',
            'center',
            'right',
        ]
    } as StringVar
};

const outputs = {};

export default class Resize extends Canvas2d<typeof inputs, typeof outputs>  {

    constructor() {
        super('Text', inputs, outputs);
        this._update();
    }

    /**
     *
     * @param {{name: string, url: string, fontface: FontFace, type: 'font'}} font
     */
    async loadFont(font) {
        if (typeof font === 'string') {
            return font;
        } else if (!font) {
            return;
        } else {
            return font.name;
        }
    }

    async render({font, fontSize, text, color, width, height, textAlign, fontStyle}, canvas, ctx) {
        canvas.width = width;
        canvas.height = height;

        ctx.font = `${fontStyle} ${fontSize}px "${(await this.loadFont(font)) || ''}"`;
        // ctx.font = `${fontStyle} ${fontSize}px "Arial"`;
        ctx.fillStyle = color;
        ctx.textAlign = textAlign;
        const x = textAlign === 'center' ? canvas.width /2 :
            textAlign === 'left' ? 0 : canvas.width;
        text.split('\\n').forEach((line, index) => {
            ctx.fillText(line, x, fontSize * (1 + index));
        });
        return canvas;
    }
}