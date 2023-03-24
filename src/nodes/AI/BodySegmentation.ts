import {
    ImageVar,
    NumberVar
} from '../io/AbstractIOSet';
import Node from "../Node";
import '@tensorflow/tfjs-backend-webgl';
import {
    SupportedModels,
    createSegmenter,
    toBinaryMask,
    drawMask,
    BodySegmenter,
    MediaPipeSelfieSegmentationMediaPipeModelConfig,
    BodySegmenterInput,
} from '@tensorflow-models/body-segmentation'
import {canvasPool2D} from "../../canvas/CanvasPool";
import {waitForMedia} from "../../utils";

const inputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    width: {
        type: 'Number',
        default: 100,
        step: 1,
        min: 1
    } as NumberVar,
    height: {
        type: 'Number',
        default: 100,
        step: 1,
        min: 1,
    } as NumberVar,
    // blur mask edges by number of pixels
    maskBlurAmount: {
        type: 'Number',
        default: 0,
        step: 1,
    } as NumberVar,
    // Default to 0.5. The minimum probability to color a pixel as foreground rather than background. The alpha channel integer values will be taken as the probabilities (for more information refer to Segmentation type's documentation).
    foregroundThreshold: {
        type: 'Number',
        default: 0.5,
        step: 0.1,
        min: 0,
        max: 1,
    } as NumberVar,
}

const outputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    originalImage: {
        type: 'Image'
    } as ImageVar,
    width: {
        type: 'Number',
    } as NumberVar,
    height: {
        type: 'Number',
    } as NumberVar,
}

export default class BodySegmentation extends Node<typeof inputs, typeof outputs> {
    private segmenter: BodySegmenter

    constructor(options={}) {
        super('BodySegmentation', inputs, outputs);
    }

    get width() {
        return this.__in.width.value;
    }

    get height() {
        return this.__in.height.value;
    }

    get image() {
        if (!this.__in.image.value) {
            return null;
        } else {
            const {width, height} = this.__in.image.value;
            return {
                image: this.__in.image.value,
                top: 0,
                left: 0,
                width,
                height,
            };
        }
    }

    async initSegmenter() {
        if (this.segmenter) {
            return;
        }
        const model = SupportedModels.MediaPipeSelfieSegmentation;
        const segmenterConfig = {
            runtime: 'tfjs',
            modelType: 'general'
        } as MediaPipeSelfieSegmentationMediaPipeModelConfig;
        this.segmenter = await createSegmenter(model, segmenterConfig);
    }

    async segmentPeople() {
        await this.initSegmenter();
        await waitForMedia(this.in.image.value);
        if (!this.in.image.value) {
            return;
        }

        const originalImageCanvas = canvasPool2D.createCanvas();
        originalImageCanvas.width = this.in.width.value;
        originalImageCanvas.height = this.in.height.value
        originalImageCanvas.acquire();
        const originalCanvasCtx = originalImageCanvas.getContext('2d');

        originalCanvasCtx.drawImage(this.in.image.value as CanvasImageSource | OffscreenCanvas, 0, 0);

        const segmentations = await this.segmenter.segmentPeople(this.in.image.value as BodySegmenterInput);

        const foregroundColor = {r: 0, g: 0, b: 0, a: 0};
        const backgroundColor = {r: 0, g: 0, b: 0, a: 255};
        const foregroundThreshold = this.in.maskBlurAmount.value;
        const backgroundDarkeningMask = await toBinaryMask(
            segmentations,
            foregroundColor,
            backgroundColor,
            false,
            foregroundThreshold
        );


        const canvas = canvasPool2D.createCanvas();
        canvas.acquire();
        const ctx = canvas.getContext('2d');
        canvas.width = this.in.width.value;
        canvas.height = this.in.height.value

        const maskBlurAmount = this.in.maskBlurAmount.value;
        await drawMask(canvas, canvas as CanvasImageSource, backgroundDarkeningMask, 1, maskBlurAmount);

        this.out.image.value = canvas;
        this.out.originalImage.value = originalImageCanvas;
        this.out.width.value = this.in.width.value;
        this.out.height.value = this.in.height.value;
    }

    async _update(){
        await this.segmentPeople();
    }
}