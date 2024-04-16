import {LevelsAbstract} from './Levels';
import {
    ImageVar,
} from '../io/AbstractIOSet';

const inputs = {
    image: {
        type: 'Image'
    } as ImageVar,
}

export default class LevelsAuto extends LevelsAbstract<typeof inputs> {

    constructor() {
        super('LevelsAuto', inputs)
    }

    _setParamsWithCanvas(gl: WebGLRenderingContext, program: WebGLProgram, canvas: HTMLCanvasElement) {
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const histogram = this.createHistogram(imageData);
        const threshold = this.calculateThreshold(histogram, imageData);

        // Find shadow and highlight
        let shadow = histogram.findIndex(value => value > threshold);
        let highlight = 255 - histogram.slice().reverse().findIndex(value => value > threshold);

        super._setParamsWithCanvas(gl, program, canvas);
        gl.uniform1f(gl.getUniformLocation(program, 'u_shadow'), shadow);
        gl.uniform1f(gl.getUniformLocation(program, 'u_highlight'), highlight);
        gl.uniform1f(gl.getUniformLocation(program, 'u_gamma'), 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_dark'), 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_light'), 255);
    }

    private createHistogram(imageData: Uint8ClampedArray): number[] {
        const histogram = new Array(256).fill(0);
        for (let i = 0; i < imageData.length; i += 4) {
            if (imageData[i + 3] > 0) { // Check if the pixel is not transparent
                let brightness = Math.round(0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]);
                histogram[brightness]++;
            }
        }

        return histogram;
    }

    private calculateThreshold(histogram: number[], imageData: Uint8ClampedArray) {
        let total = imageData.length / 4; // total number of pixels
        let sum = 0;
        for (let i = 0; i < 256; i++) {
            sum += i * histogram[i];
        }

        let sumB = 0;
        let wB = 0;
        let wF = 0;
        let varMax = 0;
        let threshold = 0;

        for (let i = 0; i < 256; i++) {
            wB += histogram[i]; // Weight Background
            if (wB === 0) continue;

            wF = total - wB; // Weight Foreground
            if (wF === 0) break;

            sumB += i * histogram[i];

            let mB = sumB / wB; // Mean Background
            let mF = (sum - sumB) / wF; // Mean Foreground

            // Calculate Between Class Variance
            let varBetween = wB * wF * (mB - mF) * (mB - mF);

            // Check if new maximum found
            if (varBetween > varMax) {
                varMax = varBetween;
                threshold = i;
            }
        }

        return threshold;
    }
}