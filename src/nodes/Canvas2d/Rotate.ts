import Canvas2d from './Canvas2d';
import {waitForMedia} from '../../utils';
import {mediaSize} from '../canvas';
import {
    NumberVar
} from '../io/AbstractIOSet';

const inputs = {
    angle: {
        type: 'Number',
        default: 0,
        min: 0,
        max: 360,
    } as NumberVar,
};

const outputs = {};

export default class Rotate extends Canvas2d<typeof inputs, typeof outputs> {

    constructor() {
        super('Rotate', inputs, outputs);
    }

    /**
     * @param {any} values
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    async render({image: media, angle}, canvas, ctx) {
        await waitForMedia(media)
        if (!media) {
            return;
        }

        if (!angle) {
            return media;
        }

       
        const {width: srcWidth, height: srcHeight} = mediaSize(media);
        const angleInRad = angle * Math.PI / 180;

        const newWidth = Math.abs(srcWidth * Math.cos(angleInRad) + srcHeight * Math.sin(angleInRad));
        const newHeight = Math.abs(srcWidth * Math.sin(angleInRad) + srcHeight * Math.cos(angleInRad));
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(angleInRad);
        ctx.drawImage(media, -srcWidth / 2, -srcHeight / 2);
        return canvas;
    }
}