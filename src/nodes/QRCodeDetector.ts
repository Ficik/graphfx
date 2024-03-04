import {
    ImageVar,
    NumberVar,
} from './io/AbstractIOSet';
import Node from "./Node";
import {canvasPool2D} from "../canvas/CanvasPool";
import {mediaSize} from './canvas';
import {OutputProperties, StringVar} from "graphfx/src/nodes/io/AbstractIOSet";
import {BrowserQRCodeReader} from "@zxing/browser";
import {Result, ResultPoint, NotFoundException} from "@zxing/library";
import {waitForMedia} from "graphfx/src/utils";

const inputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    filter: {
        type: 'String',
    } as StringVar,
}

const outputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    rotation: {
        type: 'Number',
    } as NumberVar,
    x: {
        type: 'Number',
    } as NumberVar,
    y: {
        type: 'Number',
    } as NumberVar,
    size: {
        type: 'Number',
    } as NumberVar,
};

type CanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export default class QRCodeDetector extends Node<typeof inputs, typeof outputs> {
    reader: BrowserQRCodeReader;

    constructor(options = {}) {
        super('QRCodeDetector', inputs, outputs);
        this.reader = new BrowserQRCodeReader();
    }

    async _update() {
        await waitForMedia(this.in.image.value);
        const {width, height} = mediaSize(this.__in.image.value);

        if (!this.in.image.value) {
            return;
        }

        const originalImageCanvas = canvasPool2D.createCanvas();
        originalImageCanvas.width = width;
        originalImageCanvas.height = height;
        originalImageCanvas.acquire();
        const originalCanvasCtx = originalImageCanvas.getContext('2d');

        originalCanvasCtx.drawImage(this.in.image.value as CanvasImageSource | OffscreenCanvas, 0, 0);

        this.out.rotation.value = 0;
        this.out.size.value = 0;
        this.out.x.value = 0;
        this.out.y.value = 0;

        while (true) {
            try {
                // @ts-ignore
                const result = this.reader.decodeFromCanvas(originalImageCanvas);
                const {
                    rotation,
                    size,
                    x,
                    y,
                } = this.coverQRCode(originalCanvasCtx, result);

                if (!this.in.filter.value || result.getText() === this.in.filter.value) {
                    this.out.rotation.value = rotation;
                    this.out.size.value = size;
                    this.out.x.value = x;
                    this.out.y.value = y;
                    // this.out.image.value = this.in.image.value;
                    this.out.image.value = this.in.image.value;
                    break;
                }
            } catch (e) {
                if (e instanceof NotFoundException) {
                    break;
                }
                this.out.image.value = this.in.image.value;
                console.log(e);
                break;
            }
        }
    }

    private calculateDistance = (point1: ResultPoint, point2: ResultPoint) => {
        const dx = point1.getX() - point2.getX();
        const dy = point1.getY() - point2.getY();
        return Math.sqrt(dx * dx + dy * dy);
    };

    private calculateRotation = (point1: ResultPoint, point2: ResultPoint) => {
        const dx = point2.getX() - point1.getX();
        const dy = point2.getY() - point1.getY();
        return Math.atan2(dy, dx);
    };

    private coverQRCode(ctx: CanvasContext, result: Result) {
        const resultPoints = result.getResultPoints();

        if (resultPoints.length < 3) {
            console.error('Probably not a QR code')
            return;
        }

        // @ts-ignore estimatedModuleSize is not a part of the public API but we need that value
        const qrCodeWidth = this.calculateDistance(resultPoints[0], resultPoints[2]) - resultPoints[0].estimatedModuleSize * 6;
        // @ts-ignore estimatedModuleSize is not a part of the public API but we need that value
        const finderPatternWidth = resultPoints[0].estimatedModuleSize * 7;
        const rotation = this.calculateRotation(resultPoints[0], resultPoints[1]);

        // Save the current context state
        ctx.save();

        // Translate to the center of the top left finder pattern
        ctx.translate(resultPoints[0].getX(), resultPoints[0].getY());

        // Rotate the context
        ctx.rotate(rotation);

        // Draw the rectangle
        ctx.beginPath();
        ctx.rect(-finderPatternWidth / 2, -finderPatternWidth / 2, qrCodeWidth + finderPatternWidth, qrCodeWidth + finderPatternWidth);
        ctx.fillStyle = '#FF0000';
        ctx.fill();

        // Restore the context state
        ctx.restore();

        const x = (resultPoints[0].getX() + resultPoints[2].getX()) / 2;
        const y = (resultPoints[0].getY() + resultPoints[2].getY()) / 2;

        return {
            // rotation here is in radians and I know it's -90deg, so I need to add 90deg to it
            rotation: rotation + Math.PI / 2,
            size: qrCodeWidth,
            x,
            y,
        }
    }
}
