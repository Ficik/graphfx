import {
    ImageVar,
    NumberVar,
    StringVar,
} from './io/AbstractIOSet';
import Node from './Node';
import {canvasPool2D} from '../canvas/CanvasPool';
import {BrowserQRCodeSvgWriter} from '@zxing/browser';

const inputs = {
    text: {
        type: 'String'
    } as StringVar,
    size: {
        type: 'Number',
        min: 1,
    } as NumberVar,
}

const outputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    size: {
        type: 'Number',
    } as NumberVar,
};

export default class QRCodeGenerator extends Node<typeof inputs, typeof outputs> {
    writer: BrowserQRCodeSvgWriter;

    constructor(options = {}) {
        super('QRCodeGenerator', inputs, outputs);
        this.writer = new BrowserQRCodeSvgWriter();
    }

    async _update() {
        if (!this.in.text.value || !this.in.size.value) {
            return;
        }
        BrowserQRCodeSvgWriter.QUIET_ZONE_SIZE = 0;
        const svgElement = this.writer.write(this.in.text.value, this.in.size.value, this.in.size.value);
        const canvas = canvasPool2D.createCanvas();
        canvas.width = this.in.size.value;
        canvas.height = this.in.size.value;
        canvas.acquire();
        const canvasContext = canvas.getContext('2d');

        await new Promise((resolve, reject) => {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            const svgDataUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));

            const img = new Image();
            img.onload = () => {
                canvasContext.drawImage(img, 0, 0);
                resolve(img);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = svgDataUrl;
            img.width = this.in.size.value;
            img.height = this.in.size.value;
        });

        this.out.size.value = this.in.size.value;
        this.out.image.value = canvas;
    }
}
