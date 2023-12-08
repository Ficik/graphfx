import Node from './Node';
import {BooleanVar, ImageVar, NumberVar, StringVar} from './io/AbstractIOSet';
import throttle from 'lodash/throttle'
import {createCanvas, mediaSize, paintToCanvas} from './canvas';

const numberOfImageInputs = 8;
const inputs = {
    name0: {
        type: 'String',
        default: 'image'
    } as StringVar,
    image0: {
        type: 'Image',
    } as ImageVar,
    name1: {
        type: 'String',
    } as StringVar,
    image1: {
        type: 'Image',
    } as ImageVar,
    name2: {
        type: 'String',
    } as StringVar,
    image2: {
        type: 'Image',
    } as ImageVar,
    name3: {
        type: 'String',
    } as StringVar,
    image3: {
        type: 'Image',
    } as ImageVar,
    name4: {
        type: 'String',
    } as StringVar,
    image4: {
        type: 'Image',
    } as ImageVar,
    name5: {
        type: 'String',
    } as StringVar,
    image5: {
        type: 'Image',
    } as ImageVar,
    name6: {
        type: 'String',
    } as StringVar,
    image6: {
        type: 'Image',
    } as ImageVar,
    name7: {
        type: 'String',
    } as StringVar,
    image7: {
        type: 'Image',
    } as ImageVar,
    url: {
        type: 'String',
    } as StringVar,
    query: {
        type: 'String',
    } as StringVar,
    throttleMs: {
        type: 'Number',
        default: 10000,
    } as NumberVar,
    compress: {
        type: 'Boolean',
        default: false,
    } as BooleanVar,
    quality: {
        type: 'Number',
        default: 95,
        min: 0,
        max: 100,
    } as NumberVar,
};

const outputs = {
    image: {
        type: 'Image',
    } as ImageVar,
};


export default class Api extends Node<typeof inputs, typeof outputs> {
    private updateThrottled;
    private updateThrottleWait;
    private tempCanvas: HTMLCanvasElement;
    constructor() {
        super('Api', inputs, outputs);
        this.updateThrottleWait = this.in.throttleMs.value;
        this.updateThrottled = throttle(this.upload, this.updateThrottleWait);
    }

    async _update() {
        if (!this.canUpdate()) {
            return;
        }

        if (this.updateThrottleWait !== this.in.throttleMs.value) {
            this.updateThrottleWait = this.in.throttleMs.value;
            this.updateThrottled = throttle(this.upload, this.updateThrottleWait);
        }

        try {
            this.out.image.value = await this.updateThrottled();
        } catch (e) {
            console.error(e);
            this.out.image.value = undefined;
            await new Promise((resolve) => setTimeout(resolve, this.updateThrottleWait));
        }
    }

    private canUpdate(): boolean {
        if (!this.in.url.value) {
            return false
        }

        const inputs = [
            'image0',
            'image1',
            'image2',
            'image3',
            'image4',
            'image5',
            'image6',
            'image7',
        ]

        for(const input of inputs) {
            if (this.in[input].output && !this.in[input].value) {
                return false
            }
        }

        return true;
    }

    private async upload(): Promise<HTMLImageElement | undefined> {
        const formData = await this.createFormData();

        const response = await fetch(this.in.url.value, {
            method: 'POST',
            body: formData,
        })

        if (response.status >= 400) {
            throw new Error(response.statusText);
        }

        const blob = await response.blob();

        const img = new Image();
        img.src = URL.createObjectURL(blob);
        await new Promise((resolve) => {
            img.onload = () => {
                resolve();
            }
        })

        return img;
    }

    private async createFormData() {
        const formData = new FormData();

        const queryString = new URLSearchParams(this.in.query.value);
        queryString.forEach((value, key) => {
            formData.append(key, value);
        })

        for(let i = 0; i < numberOfImageInputs; i++) {
            if (this.in['name' + i].value && this.in['image' + i].value) {
                formData.append(this.in['name' + i].value, await this.getBlobFromImage(this.in['image' + i].value));
            }
        }

        return formData;
    }

    private async getBlobFromImage(media: CanvasImageSource): Promise<Blob> {
        const {width, height} = mediaSize(media)
        if (!this.tempCanvas) {
            this.tempCanvas = createCanvas(width, height);
        }

        this.tempCanvas.width = width;
        this.tempCanvas.height = height;
        paintToCanvas(this.tempCanvas, media, {
            top: 0, left: 0, width, height,
        })

        return await new Promise((resolve, reject) => {
            this.tempCanvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject();
                    }
                    resolve(blob);
                },
                this.in.compress.value ? 'image/jpeg' : 'image/png',
                this.in.compress.value,
            )
        });
    }
}