import {
    ImageVar,
    NumberVar,
    StringVar,
    ColorVar,
} from './io/AbstractIOSet';
import Node from './Node';
import {canvasPool2D} from '../canvas/CanvasPool';
import {BrowserQRCodeSvgWriter} from '@zxing/browser';
import {EncodeHintType, QRCodeDecoderErrorCorrectionLevel} from '@zxing/library';

const inputs = {
    text: {
        type: 'String'
    } as StringVar,
    size: {
        type: 'Number',
        min: 1,
    } as NumberVar,
    correction: {
        type: 'String',
        default: 'L',
        enum: [
            'L', /** L = ~7% correction */
            'M', /** M = ~15% correction */
            'Q', /** Q = ~25% correction */
            'H', /** H = ~30% correction */
        ],
    } as StringVar,
    margin: {
        type: 'Number',
        min: 0,
    } as NumberVar,
    color: {
        type: 'Color',
        default: '#000000',
    } as ColorVar,
}

const outputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    size: {
        type: 'Number',
    } as NumberVar,
    margin: {
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
        const encodeHintTypeMap = new Map<EncodeHintType, any>();
        encodeHintTypeMap.set(EncodeHintType.MARGIN, this.in.margin.value);
        encodeHintTypeMap.set(EncodeHintType.ERROR_CORRECTION, QRCodeDecoderErrorCorrectionLevel[this.in.correction.value]);
        const svgElement: SVGSVGElement = this.writer.write(this.in.text.value, this.in.size.value, this.in.size.value, encodeHintTypeMap);

        for(const element of svgElement.querySelectorAll('[fill]')) {
            element.setAttribute('fill', this.in.color.value);
        }

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

        this.out.margin.value = this.in.margin.value;
        this.out.size.value = this.in.size.value;
        this.out.image.value = canvas;
    }
}
