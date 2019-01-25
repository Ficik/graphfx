import Node from '../Node';
import {waitForMedia} from '../../utils';

export default class Canvas2d extends Node {
    constructor(name, inputDefinition, outputDefiniton, options) {
        super(name,
            Object.assign({
                image: {
                    type: 'Image',
                },
            }, inputDefinition),
            Object.assign({
                image: {
                    type: 'Image',
                },
                width: {
                    type: 'Number',
                },
                height: {
                    type: 'Number',
                }
            }, outputDefiniton),
            options
        );
        this.__canvas = document.createElement('canvas');
    }

    destroy() {
        this.__canvas = null;
        super.destroy();
    }

    async _update() {
        const values = {};
        for (let name of Object.keys(this.in.variables)) {
            values[name] = await waitForMedia(this.in[name].value);
        }
        const ctx = this.__canvas.getContext('2d');
        if (this.__canvas.width > 0 && this.__canvas.height > 0) {
            ctx.clearRect(0,0,this.__canvas.width, this.__canvas.height);
        }
        const result = await this.render(values, this.__canvas, ctx);
        if (result instanceof ImageBitmap) {
            this.__out.image.value = result;
            if (this.out.width.value !== this.out.image.value.width) {
                this.out.width.value = this.out.image.value.width;
            }
            if (this.out.height.value !== this.out.image.value.height) {
                this.out.height.value = this.out.image.value.height;
            }
        }
    }


    /**
     *
     * @param {any} values
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     * @returns {Promise<ImageBitmap|null>}
     */
    async render(values, canvas, ctx) {
        return null;
    }
}