import {
    ImageVar,
    NumberVar,
    StringVar,
    VariableValueType,
} from '../io/AbstractIOSet';
import Node from "../Node";
import '@tensorflow/tfjs-backend-webgl';
import {Face,
    FaceDetector,
    FaceDetectorInput,
    MediaPipeFaceDetectorMediaPipeModelConfig,
    SupportedModels,
    createDetector,
} from '@tensorflow-models/face-detection';
import {canvasPool2D} from "../../canvas/CanvasPool";
import {waitForMedia} from "../../utils";
import { mediaSize } from '../canvas';
import {first} from 'lodash/array';
import keyBy from 'lodash/keyBy';
import {OutputProperties} from "graphfx/src/nodes/io/AbstractIOSet";

const inputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    modelUrl: {
        type: 'String',
    } as StringVar,
}

const outputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    faceX: {
        type: 'Number',
    } as NumberVar,
    faceY: {
        type: 'Number',
    } as NumberVar,
    faceWidth: {
        type: 'Number',
    } as NumberVar,
    faceHeight: {
        type: 'Number',
    } as NumberVar,
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
};

type Outputs = typeof outputs;
type UpdateOutputNodesPayload = Partial<{[key in keyof OutputProperties<Outputs>]: VariableValueType<Outputs[key]>}>;

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
            detectorModelUrl: this.in.modelUrl.value ? this.in.modelUrl.value : undefined,
        } as MediaPipeFaceDetectorMediaPipeModelConfig;
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

        if (detections.length) {
            const detection: Face = first(detections);
            const keyPoints = keyBy(detection.keypoints, (keyPoint) => keyPoint.name)
            this.updateOutputNodes({
                faceX: detection.box.xMin,
                faceY: detection.box.yMin,
                faceWidth: detection.box.width,
                faceHeight: detection.box.height,
                rightEyeX: keyPoints['rightEye'].x,
                rightEyeY: keyPoints['rightEye'].y,
                leftEyeX: keyPoints['leftEye'].x,
                leftEyeY: keyPoints['leftEye'].y,
                noseTipX: keyPoints['noseTip'].x,
                noseTipY: keyPoints['noseTip'].y,
                mouthCenterX: keyPoints['mouthCenter'].x,
                mouthCenterY: keyPoints['mouthCenter'].y,
                rightEarTragionX: keyPoints['rightEarTragion'].x,
                rightEarTragionY: keyPoints['rightEarTragion'].y,
                leftEarTragionX: keyPoints['leftEarTragion'].x,
                leftEarTragionY: keyPoints['leftEarTragion'].y,
                image: this.in.image.value,
            })
        } else {
            this.updateOutputNodes({
                faceX: undefined,
                faceY: undefined,
                faceWidth: undefined,
                faceHeight: undefined,
                rightEyeX: undefined,
                rightEyeY: undefined,
                leftEyeX: undefined,
                leftEyeY: undefined,
                noseTipX: undefined,
                noseTipY: undefined,
                mouthCenterX: undefined,
                mouthCenterY: undefined,
                rightEarTragionX: undefined,
                rightEarTragionY: undefined,
                leftEarTragionX: undefined,
                leftEarTragionY: undefined,
                image: this.in.image.value,
            });
        }
    }

    updateOutputNodes(payload: UpdateOutputNodesPayload) {
        for(let key of Object.keys(payload)) {
            this.out[key].__value = payload[key];
            this.out[key].__notifyListeners();
        }
    }

    async _update(){
        await this.detectFeatures();
    }
}
