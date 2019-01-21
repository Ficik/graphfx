import Node from './Node';
import {createCanvas, mediaSize, paintToCanvas} from './canvas';

export default class Resize extends Node {

    constructor(options) {
        super('Resize', {
            image: 'Image',
            width: 'Number',
            height: 'Number',
        }, {
            image: 'Image'
        });
        this.options = options;
    }

    get width() {
        return this.__in.width.value || this.options.width;
    }

    get height() {
        return this.__in.height.value || this.options.height;
    }

    __update() {
        const media = this.__in.image.value;
        if (!media) {
            return;
        }
        const canvas = createCanvas(this.width, this.height);

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
        this.__out.image.value = canvas;
    }
}