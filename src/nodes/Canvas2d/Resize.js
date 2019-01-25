import Canvas2d from './Canvas2d';
import {waitForMedia} from '../../utils';
import {createCanvas, mediaSize, paintToCanvas} from '../canvas';

export default class Resize extends Canvas2d {

    constructor() {
        super('Resize', {
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
        }, {});
    }

    /**
     * @param {any} values
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    async render({image: media, width, height}, canvas, ctx) {
        await waitForMedia(media)
        if (!media) {
            return;
        }

        if (!width || !height) {
            return;
        }

        canvas.width = width;
        canvas.height = height;

        const {width: srcWidth, height: srcHeight} = mediaSize(media);
        const {width: destWidth, height: destHeight} = mediaSize(canvas);
        const srcAspectRatio = (srcWidth / srcHeight);
        const destAspectRatio = (destWidth / destHeight);
        const newImage = {};
        if (srcAspectRatio > destAspectRatio) {
          newImage.width = destHeight * srcAspectRatio;
          newImage.height = destHeight;
        } else {
          newImage.width = destWidth;
          newImage.height = destWidth / srcAspectRatio;
        }

        newImage.top = (destHeight - newImage.height) / 2;
        newImage.left = (destWidth - newImage.width) / 2;

        paintToCanvas(canvas, media, newImage);
        return await createImageBitmap(canvas);
    }
}