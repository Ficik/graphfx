import Node from './Node';
import {createCanvas} from './canvas';

export default class ToBlob extends Node {

    constructor(options) {
        super('ToBlob', {
            image: 'Image',
        }, {
            image: 'Image',
        });
        this.options = Object.assign({
            quality: 100,
            mimetype: 'image/jpeg',
        }, options);
    }

    get mimetype() {
        return this.options.mimetype;
    }

    get quality() {
        return this.options.quality;
    }

    _update() {
        const {width, height} = this.__in.image.value;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(this.__in.image.value, 0, 0);
        canvas.toBlob((blob) => {
            this.__out.image.value = blob;
        }, this.mimetype, this.quality);
    }

}