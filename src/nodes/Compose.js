import Node from './Node';
import {createCanvas, mediaSize, paintToCanvas} from './canvas';

export default class Compose extends Node {

    constructor(options) {
        super('Compose', {
            fg: {
                type: 'Image'
            },
            fgX: {
                type: 'Number',
                default: 0,
                step: 1,
            },
            fgY: {
                type: 'Number',
                default: 0,
                step: 1,
            },
            bg: {
                type: 'Image',
            },
            bgX: {
                type: 'Number',
                default: 0,
                step: 1,
            },
            bgY: {
                type: 'Number',
                default: 0,
                step: 1,
            },
            width: {
                type: 'Number',
                default: 100,
                step: 1,
                min: 1
            },
            height: {
                type: 'Number',
                default: 100,
                step: 1,
                min: 1,
            },
            mode: {
                type: 'String',
                default: 'source-over',
                enum: [
                    'source-over',
                    'source-in',
                    'source-out',
                    'source-atop',
                    'destination-over',
                    'destination-in',
                    'destination-out',
                    'destination-atop',
                    'lighter',
                    'copy',
                    'xor',
                    'multiply',
                    'screen',
                    'overlay',
                    'darken',
                    'lighten',
                    'color-dodge',
                    'color-burn',
                    'hard-light',
                    'soft-light',
                    'difference',
                    'exclusion',
                    'hue',
                    'saturation',
                    'color',
                    'luminosity',
                ]
            }
        }, {
            image: {
                type: 'Image'
            }
        }, options);
    }

    get width() {
        return this.__in.width.value;
    }

    get height() {
        return this.__in.height.value;
    }

    get fg() {
        if (!this.__in.fg.value) {
            return null;
        } else {
            const {width, height} = this.__in.fg.value;
            return {
                image: this.__in.fg.value,
                top: this.__in.fgY.value || 0,
                left: this.__in.fgX.value || 0,
                width,
                height,
            };
        }
    }

    get bg() {
        if (!this.__in.bg.value) {
            return null;
        } else {
            const {width, height} = this.__in.bg.value;
            return {
                image: this.__in.bg.value,
                top: this.__in.bgY.value || 0,
                left: this.__in.bgX.value || 0,
                width,
                height,
            };
        }
    }

    __update() {
        if (!this.width || !this.height) {
            return;
        }
        const canvas = createCanvas(this.width, this.height);

        if (this.bg) {
            paintToCanvas(canvas, this.bg.image, this.bg);
        }

        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = this.mode;

        if (this.fg) {
            paintToCanvas(canvas, this.fg.image, this.fg);
        }

        this.__out.image.value = canvas;
    }
}