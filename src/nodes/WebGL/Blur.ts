import WebGL from './WebGl';
import {
    ImageVar,
    NumberVar
} from '../io/AbstractIOSet';

const inputs = {
    image: {
        type: 'Image',
    } as ImageVar,
    radius: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    sigma: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    passes: {
        type: 'Number',
        default: 1,
    } as NumberVar,
}


const outputs = {
    image: {
        type: 'Image',
    } as ImageVar,
    width: {
        type: 'Number',
    } as NumberVar,
    height: {
        type: 'Number',
    } as NumberVar
}

export default class Blur extends WebGL<typeof inputs> {

    _lastRadiusValue?: number;

    constructor() {
        super('Blur', inputs)
    }

    _passes() {

        const passes = Array(Math.max(this.in.passes.value, 0))
            .fill(null)
            .flatMap((x, i) => {
                return [
                    (gl, program) => {
                        if (i === 0) {
                            this._setParams(gl, program)
                        }
                        this._setDirection(gl, program, [1, 0]) // Horizontal blur
                    },
                    (gl, program) => {
                        this._setDirection(gl, program, [0, 1]) // Vertical blur
                    }
                ]
            });
        return passes;
    }

    setup() {
        if (this.in.radius.value !== this._lastRadiusValue) {
            this.program = undefined;
        }
        super.setup();
        this._lastRadiusValue = this.in.radius.value;
    }

    get frag() {
        const RADIUS = Math.ceil(this.in.radius.value);
        const KERNEL_SIZE = RADIUS + 1;
        return `
        precision mediump float;

        const int RADIUS = ${RADIUS};
        // Our texture
        uniform sampler2D u_image;

        uniform vec2 u_resolution;
        uniform vec2 u_direction;
        uniform vec2 u_textureSize;

        uniform float u_kernel[${KERNEL_SIZE}];

        // The texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        void main() {
            vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

            float totalWeight = u_kernel[0]; // Center weight
            vec4 colorSum = texture2D(u_image, v_texCoord) * totalWeight; // center pixel

            for (int i = 1; i < ${KERNEL_SIZE}; i++) {
                float weight = u_kernel[i];
                totalWeight += weight * 2.0; // Consider both sides of the kernel
                vec4 color1 = texture2D(u_image, v_texCoord + onePixel * (u_direction * float(i)));
                vec4 color2 = texture2D(u_image, v_texCoord - onePixel * (u_direction * float(i)));
                colorSum += (color1 + color2) * weight;
            }

            gl_FragColor = colorSum / totalWeight;
            gl_FragColor.a = 1.0;
        }
        `
    }

    gaussian(x, sigma) {
        const coeff = 1.0 / (2.0 * Math.PI * sigma * sigma);
        const expon = -(x * x) / (2.0 * sigma * sigma);
        return coeff * Math.exp(expon);
    }

    createGaussianKernel(radius, sigma) {
        const kernelSize = radius + 1;
        const kernel = new Float32Array(kernelSize);

        for (let i = 0; i < kernelSize; i++) {
            kernel[i] = this.gaussian(i, sigma);
        }

        return kernel;
    }


    _setDirection(gl: WebGLRenderingContext, program: WebGLProgram, direction: [number, number]) {
        gl.uniform2f(gl.getUniformLocation(program, 'u_direction'), direction[0], direction[1]);
    }

    /**
     *
     * @param {WebGLRenderingContext} gl
     * @param {*} program
     */
    _setParams(gl, program) {
        const kernel = this.createGaussianKernel(
            this.in.radius.value,
            this.in.sigma.value,
        )
        gl.uniform1fv(gl.getUniformLocation(program, 'u_kernel'), kernel);
    }
}