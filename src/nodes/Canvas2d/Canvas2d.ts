import Node from '../Node';
import {waitForMedia, merge} from '../../utils';
import {canvasPool2D} from '../../canvas/CanvasPool';
import {
    Variables,
    ImageVar,
    BooleanVar,
    NumberVar
} from '../io/AbstractIOSet';

const inputs = {
    image: {
        type: 'Image',
    } as ImageVar,
};

const outputs = {
    image: {
        type: 'Image',
    } as ImageVar,
    width: {
        type: 'Number',
    } as NumberVar,
    height: {
        type: 'Number',
    } as NumberVar
};



export default class Canvas2d<I extends Variables, O extends Variables> extends Node<I & (typeof inputs), O & (typeof outputs)> {
    constructor(name, inputDefinition: I, outputDefiniton: O, options) {
        super(name,
            merge(inputs, inputDefinition),
            merge(outputs, outputDefiniton),
            options
        );
    }

    destroy() {
        super.destroy();
    }

    async _update() {
        const values = {};
        for (let name of Object.keys(this.in.variables)) {
            values[name] = await waitForMedia(this.in[name].value);
        }

        const canvas = canvasPool2D.createCanvas();
        canvas.acquire();
        const ctx = canvas.getContext('2d');
        canvas.width = 1;
        canvas.height = 1;
        if (values.image && values.image.acquire) {
            values.image.acquire();
        }

        const lastResult = this.__out.image.value;
        try {
            const result = await this.render(values, canvas, ctx);
            this.out.image.value = result;
            this.__updateOutputDimensions();
        } catch (err) {
            console.error('Error in render', err);
            canvas.release();
        }

        if (values.image && values.image.release) {
            values.image.release();
        }

        if (lastResult && lastResult.release) {
            lastResult.release();
        }
    }

    __updateOutputDimensions() {
        if (!this.out.image.value) {
            return;
        }
        if (this.out.width.value !== this.out.image.value.width) {
            this.out.width.value = this.out.image.value.width;
        }
        if (this.out.height.value !== this.out.image.value.height) {
            this.out.height.value = this.out.image.value.height;
        }
    }


    /**
     *
     * @param {any} values
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     * @returns {Promise<HTMLCanvasElement|null>}
     */
    async render(values, canvas, ctx) {
        return null;
    }
}