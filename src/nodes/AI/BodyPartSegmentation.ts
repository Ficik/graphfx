import {
    BooleanVar,
    ImageVar,
    NumberVar
} from '../io/AbstractIOSet';
import Node from "../Node";
import '@tensorflow/tfjs-backend-webgl';
import {
    SupportedModels,
    createSegmenter,
    toColoredMask,
    drawMask,
    BodySegmenter,
    BodyPixSegmentationConfig,
    BodySegmenterInput,
} from '@tensorflow-models/body-segmentation'
import {canvasPool2D} from "../../canvas/CanvasPool";
import {waitForMedia} from "../../utils";
import { mediaSize } from '../canvas';
import flow from 'lodash/flow'
import mapValues from "lodash/mapValues";
import keyBy from "lodash/keyBy";

const bodyParts = [
    'left_face',
    'right_face',
    'left_upper_arm_front',
    'left_upper_arm_back',
    'right_upper_arm_front',
    'right_upper_arm_back',
    'left_lower_arm_front',
    'left_lower_arm_back',
    'right_lower_arm_front',
    'right_lower_arm_back',
    'left_hand',
    'right_hand',
    'torso_front',
    'torso_back',
    'left_upper_leg_front',
    'left_upper_leg_back',
    'right_upper_leg_front',
    'right_upper_leg_back',
    'left_lower_leg_front',
    'left_lower_leg_back',
    'right_lower_leg_front',
    'right_lower_leg_back',
    'left_foot',
    'right_foot',
]

const inputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    // blur mask edges by number of pixels
    maskBlurAmount: {
        type: 'Number',
        default: 1,
        step: 0.1,
    } as NumberVar,
    // Default to 0.5. The minimum probability to color a pixel as foreground rather than background. The alpha channel integer values will be taken as the probabilities (for more information refer to Segmentation type's documentation).
    foregroundThreshold: {
        type: 'Number',
        default: 0.5,
        step: 0.1,
        min: 0,
        max: 1,
    } as NumberVar,
    ...(flow([
        bodyParts => keyBy(bodyParts, (bodyPart) => bodyPart),
        bodyParts => mapValues(bodyParts, () => ({
            type: 'Boolean',
            default: false,
        } as BooleanVar))
    ])(bodyParts))
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

export default class BodyPartSegmentation extends Node<typeof inputs, typeof outputs> {
    private segmenter: BodySegmenter

    constructor(options={}) {
        super('BodyPartSegmentation', inputs, outputs);
    }

    async initSegmenter() {
        if (this.segmenter) {
            return;
        }
        const model = SupportedModels.BodyPix;
        const segmenterConfig = {
            runtime: 'tfjs',
            modelType: 'general',
            segmentBodyParts: true,
        } as BodyPixSegmentationConfig;
        this.segmenter = await createSegmenter(model, segmenterConfig);
    }

    async segmentPeople() {
        await this.initSegmenter();
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

        const segmentations = await this.segmenter.segmentPeople(this.in.image.value as BodySegmenterInput,{multiSegmentation: false, segmentBodyParts: true});

        const foregroundColor = {r: 0, g: 0, b: 0, a: 0};
        const backgroundColor = {r: 0, g: 0, b: 0, a: 255};
        const foregroundThreshold = this.in.foregroundThreshold.value;

        const backgroundDarkeningMask = await toColoredMask(segmentations, (value) => {
            if (value < 0) {
                return backgroundColor;
            }

            // performance issue
            if (this.in[bodyParts[value]].value) {
                return foregroundColor;
            } else {
                return backgroundColor
            }
        }, backgroundColor, foregroundThreshold)


        const canvas = canvasPool2D.createCanvas();
        canvas.acquire();
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        const maskBlurAmount = this.in.maskBlurAmount.value;
        await drawMask(canvas, canvas as CanvasImageSource, backgroundDarkeningMask, 1, maskBlurAmount);
        this.out.image.value = canvas;
        this.out.originalImage.value = originalImageCanvas;
        this.out.width.value = width;
        this.out.height.value = height;
    }

    async _update(){
        await this.segmentPeople();
    }
}