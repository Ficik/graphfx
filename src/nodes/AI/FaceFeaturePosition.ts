import {
    ImageVar,
    NumberVar
} from '../io/AbstractIOSet';
import Node from "../Node";
import '@tensorflow/tfjs-backend-webgl';
import {
    Face,
    FaceDetector,
    FaceDetectorInput,
    SupportedModels,
    createDetector,
    MediaPipeFaceDetectorTfjsModelConfig
} from '@tensorflow-models/face-detection';
import {canvasPool2D} from "../../canvas/CanvasPool";
import {waitForMedia} from "../../utils";
import { mediaSize } from '../canvas';
import {first} from 'lodash/array';
import keyBy from 'lodash/keyBy';

const inputs = {
    image: {
        type: 'Image'
    } as ImageVar,
}

const outputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    rightEyeX: {
        type: 'Number',
    } as NumberVar,
    rightEyeY: {
        type: 'Number',
    } as NumberVar,
    leftEyeX: {
        type: 'Number',
    } as NumberVar,
    leftEyeY: {
        type: 'Number',
    } as NumberVar,
    noseTipX: {
        type: 'Number',
    } as NumberVar,
    noseTipY: {
        type: 'Number',
    } as NumberVar,
    mouthCenterX: {
        type: 'Number',
    } as NumberVar,
    mouthCenterY: {
        type: 'Number',
    } as NumberVar,
    rightEarTragionX: {
        type: 'Number',
    } as NumberVar,
    rightEarTragionY: {
        type: 'Number',
    } as NumberVar,
    leftEarTragionX: {
        type: 'Number',
    } as NumberVar,
    leftEarTragionY: {
        type: 'Number',
    } as NumberVar,
}

export default class FaceFeaturePosition extends Node<typeof inputs, typeof outputs> {
    private detector: FaceDetector

    constructor(options={}) {
        super('FaceFeaturePosition', inputs, outputs);
    }

    async initDetector() {
        if (this.detector) {
            return;
        }
        const model = SupportedModels.MediaPipeFaceDetector;
        const detectorConfig = {
            maxFaces: 1,
            modelType: 'short',
            runtime: 'tfjs',
        } as MediaPipeFaceDetectorTfjsModelConfig;
        this.detector = await createDetector(model, detectorConfig);
    }

    async detectFeatures() {
        await this.initDetector();
        await waitForMedia(this.in.image.value);
        if (!this.in.image.value) {
            return;
        }
        const {width, height} = mediaSize(this.__in.image.value);

        const originalImageCanvas = canvasPool2D.createCanvas();
        originalImageCanvas.width = width;
        originalImageCanvas.height = height;
        originalImageCanvas.acquire();
        const originalCanvasCtx = originalImageCanvas.getContext('2d');

        originalCanvasCtx.drawImage(this.in.image.value as CanvasImageSource | OffscreenCanvas, 0, 0);

        const detections = await this.detector.estimateFaces(this.in.image.value as FaceDetectorInput, {flipHorizontal: false});

        if (!detections.length) {
            this.out.image.value = this.in.image.value;
            return;
        }

        const detection: Face = first(detections);
        const keyPoints = keyBy(detection.keypoints, (keyPoint) => keyPoint.name)

        this.out.image.value = this.in.image.value;
        this.out.rightEyeX.value = keyPoints['rightEye'].x;
        this.out.rightEyeY.value = keyPoints['rightEye'].y;
        this.out.leftEyeX.value = keyPoints['leftEye'].x;
        this.out.leftEyeY.value = keyPoints['leftEye'].y;
        this.out.noseTipX.value = keyPoints['noseTip'].x;
        this.out.noseTipY.value = keyPoints['noseTip'].y;
        this.out.mouthCenterX.value = keyPoints['mouthCenter'].x;
        this.out.mouthCenterY.value = keyPoints['mouthCenter'].y;
        this.out.rightEarTragionX.value = keyPoints['rightEarTragion'].x;
        this.out.rightEarTragionY.value = keyPoints['rightEarTragion'].y;
        this.out.leftEarTragionX.value = keyPoints['leftEarTragion'].x;
        this.out.leftEarTragionY.value = keyPoints['leftEarTragion'].y;
    }

    async _update(){
        await this.detectFeatures();
    }
}