import Node from './Canvas2d';
import {waitForMedia} from '../../utils';
import {createCanvas, mediaSize, paintToCanvas} from '../canvas';


export default class ImageIdentity extends Node {
    constructor() {
        super('ImageIdentity', {
        }, {
        });
    }

    async render({image}) {
        if (!image) {
            return;
        }
        const {width, height} = mediaSize(image);
        const canvas = createCanvas(width, height);
        paintToCanvas(canvas, image, {width, height, top: 0, left: 0});
        const dataUrl = canvas.toDataURL()
        const i = new Image();
        i.src = dataUrl;
        await waitForMedia(i);
        this.__out.image.value = i;
    }
}