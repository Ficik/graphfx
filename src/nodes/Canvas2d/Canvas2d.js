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
                }
            }, outputDefiniton),
            options
        );
        this.__canvas = document.createElement('canvas');
    }

    async __update() {
        const values = {};
        for (let name of Object.keys(this.in.variables)) {
            values[name] = await waitForMedia(this.in[name].value);
        }
        const ctx = this.__canvas.getContext('2d');
        if (this.__canvas.width > 0 && this.__canvas.height > 0) {
            ctx.clearRect(0,0,this.__canvas.width, this.__canvas.height);
        }
        await this.render(values, this.__canvas, ctx);
    }


    /**
     *
     * @param {any} values
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    async render(values, canvas, ctx) {

    }
}