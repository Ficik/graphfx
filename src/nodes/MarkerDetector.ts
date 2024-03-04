import {
    ImageVar,
    NumberVar,
    StringVar,
} from './io/AbstractIOSet';
import Node from "./Node";
import {canvasPool2D} from "../canvas/CanvasPool";
import {mediaSize} from './canvas';
import {waitForMedia} from "../utils";
import {Detector, Marker} from '../../vendor/ts-aruco/src/aruco'

enum PivotPoint {
    LEFT_TOP = "left_top",
    RIGHT_TOP = "right_top",
    LEFT_BOTTOM = "left_bottom",
    RIGHT_BOTTOM = "right_bottom",
    CENTER = "center",
}

const inputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    markerId: {
        type: 'Number',
    } as NumberVar,
    pivotPoint: {
        type: 'String',
        enum: [
            PivotPoint.LEFT_TOP,
            PivotPoint.RIGHT_TOP,
            PivotPoint.LEFT_BOTTOM,
            PivotPoint.RIGHT_BOTTOM,
            PivotPoint.CENTER,
        ],
    } as StringVar,
}

const outputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    markerId: {
        type: 'Number'
    } as NumberVar,
    x: {
        type: 'Number'
    } as NumberVar,
    y: {
        type: 'Number'
    } as NumberVar,
    rotation: {
        type: 'Number'
    } as NumberVar,
    x1: {
        type: 'Number'
    } as NumberVar,
    y1: {
        type: 'Number'
    } as NumberVar,
    x2: {
        type: 'Number'
    } as NumberVar,
    y2: {
        type: 'Number'
    } as NumberVar,
};

type CanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export default class MarkerDetector extends Node<typeof inputs, typeof outputs> {
    detector: Detector;

    constructor(options = {}) {
        super('MarkerDetector', inputs, outputs);
        this.detector = new Detector();
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
        const originalImageCanvasCtx = originalImageCanvas.getContext('2d');

        originalImageCanvasCtx.drawImage(this.in.image.value as CanvasImageSource | OffscreenCanvas, 0, 0);

        let results = this.detector.detect(originalImageCanvasCtx.getImageData(0, 0, width, height));

        if (this.in.markerId.value) {
            results = results.filter((marker) => marker.id === this.in.markerId.value);
        }

        if (results.length === 0) {
            this.out.image.value = originalImageCanvas;
            this.out.markerId.value = undefined;
            this.out.x.value = undefined;
            this.out.y.value = undefined;
            this.out.rotation.value = undefined;
            this.out.x1.value = undefined;
            this.out.y1.value = undefined;
            this.out.x2.value = undefined;
            this.out.y2.value = undefined;
            return;
        }

        const result = results[0];

        const {
            id,
            x,
            y,
            rotation,
            x1,
            y1,
            x2,
            y2,

        } = this.calculateOutput(result, this.in.pivotPoint.value as PivotPoint);

        this.out.image.value = originalImageCanvas;
        this.out.markerId.value = id;
        this.out.x.value = x;
        this.out.y.value = y;
        this.out.rotation.value = rotation;
        this.out.x1.value = x1;
        this.out.y1.value = y1;
        this.out.x2.value = x2;
        this.out.y2.value = y2;
    }

    private calculateOutput(marker: Marker, pivot: PivotPoint = PivotPoint.LEFT_TOP) {
        const {points} = marker.corners;

        const minX = Math.min(...points.map((p) => p.x));
        const minY = Math.min(...points.map((p) => p.y));
        const maxX = Math.max(...points.map((p) => p.x));
        const maxY = Math.max(...points.map((p) => p.y));
        const w = maxX - minX;
        const h = maxY - minY;

        let x: number, y: number;
        switch (pivot) {
            case PivotPoint.CENTER:
                x = minX + w / 2;
                y = minY + h / 2;
                break;
            case PivotPoint.LEFT_TOP:
                x = minX;
                y = minY;
                break;
            case PivotPoint.RIGHT_TOP:
                x = maxX;
                y = minY;
                break;
            case PivotPoint.LEFT_BOTTOM:
                x = minX;
                y = maxY;
                break;
            case PivotPoint.RIGHT_BOTTOM:
                x = maxX;
                y = maxY;
                break;
        }

        const rotation = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x) * (180 / Math.PI);

        return {
            id: marker.id,
            x,
            y,
            rotation,
            x1: points[0].x,
            y1: points[0].y,
            x2: points[1].x,
            y2: points[1].y,
        };
    }
}
