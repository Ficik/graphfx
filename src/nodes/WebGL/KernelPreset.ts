import WebGL from './WebGl';
import {
    ImageVar,
    NumberVar,
    StringVar
} from '../io/AbstractIOSet';

const kernels = {
    'sobel': {
        size: 3,
        kernel: [
            -1.0, -2.0, -1.0,
            0.0,  0.0,  0.0,
            1.0,  2.0,  1.0
        ]
    },
    'laplacian': {
        size: 3,
        kernel: [
            0.0,  1.0, 0.0,
            1.0, -4.0, 1.0,
            0.0,  1.0, 0.0
        ]
    },
    'laplacianOfGaussian': {
        size: 5,
        kernel: [
            0.0,  0.0, -1.0,  0.0,  0.0,
            0.0, -1.0, -2.0, -1.0,  0.0,
           -1.0, -2.0, 16.0, -2.0, -1.0,
            0.0, -1.0, -2.0, -1.0,  0.0,
            0.0,  0.0, -1.0,  0.0,  0.0
        ]
    },
    'emboss': {
        size: 3,
        kernel: [
            -2.0, -1.0,  0.0,
            -1.0,  1.0,  1.0,
            0.0,  1.0,  2.0
        ]
    },
    'sharpen': {
        size: 3,
        kernel: [
            0.0, -1.0,  0.0,
            -1.0,  5.0, -1.0,
             0.0, -1.0,  0.0
        ]
    },
    'boxBlur': {
        size: 3,
        kernel: [
            1.0/9.0, 1.0/9.0, 1.0/9.0,
            1.0/9.0, 1.0/9.0, 1.0/9.0,
            1.0/9.0, 1.0/9.0, 1.0/9.0
        ]
    },
    'outline': {
        size: 3,
        kernel: [
            -2.0, -1.0,  0.0,
            -1.0,  1.0,  1.0,
            0.0,  1.0,  2.0
        ]
    },
    'erosion': {
        size: 3,
        kernel: [
            0.0, 1.0, 0.0,
            1.0, 1.0, 1.0,
            0.0, 1.0, 0.0
        ]
    },
    'dilation': {
        size: 3,
        kernel: [
            1.0, 1.0, 1.0,
            1.0, 0.0, 1.0,
            1.0, 1.0, 1.0
        ]
    },
    'unsharpMask': {
        size: 5,
        kernel: [
             -1.0/256.0,   -4.0/256.0,   -6.0/256.0,   -4.0/256.0,  -1.0/256.0,
             -4.0/256.0,    1.0/256.0,   13.0/256.0,    1.0/256.0,  -4.0/256.0,
             -6.0/256.0,   13.0/256.0,  269.0/256.0,   13.0/256.0,  -6.0/256.0,
             -4.0/256.0,    1.0/256.0,   13.0/256.0,    1.0/256.0,  -4.0/256.0,
             -1.0/256.0,   -4.0/256.0,   -6.0/256.0,   -4.0/256.0,  -1.0/256.0
        ]
    }
}


const inputs = {
    image: {
        type: 'Image',
    } as ImageVar,
    preset: {
        type: 'String',
        default: 'sobel',
        enum: Object.keys(kernels),
    } as StringVar,
    passes: {
        type: 'Number',
        default: 1,
    } as NumberVar,
    multiplier: {
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

export default class KernelPreset extends WebGL<typeof inputs> {

    _lastKernelSize?: number;

    constructor() {
        super('KernelPreset', inputs)
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
                    }
                ]
            });
        return passes;
    }

    get currentPreset() {
        return kernels[this.in.preset.value];
    }

    setup() {
        if (this.currentPreset.size !== this._lastKernelSize) {
            this.program = undefined;
        }
        super.setup();
        this._lastKernelSize = this.currentPreset.size;
    }

    get frag() {
        const KERNEL_SIZE = Math.ceil(this.currentPreset.size);
        const shader = `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;
        uniform vec2 u_textureSize;
        uniform float u_kernel[${KERNEL_SIZE * KERNEL_SIZE}];

        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        const int RADIUS = ${KERNEL_SIZE};

        vec4 applyKernel(in vec2 texCoord) {
            vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
            vec4 colorSum = vec4(0.0);

            for (int y = 0; y < RADIUS; y++) {
                for (int x = 0; x < RADIUS; x++) {
                    vec2 offset = vec2(float(x - RADIUS/2), float(y - RADIUS/2));
                    colorSum += texture2D(u_image, texCoord + onePixel * offset) * u_kernel[y * RADIUS + x];
                }
            }

            return colorSum;
        }

        void main() {
            gl_FragColor = applyKernel(v_texCoord);
        }
        `;
        console.log(shader);
        return shader;
    }


    /**
     *
     * @param {WebGLRenderingContext} gl
     * @param {*} program
     */
    _setParams(gl, program) {
        const kernel = this.currentPreset.kernel;
        if (kernel) {
            gl.uniform1fv(
                gl.getUniformLocation(program, 'u_kernel'),
                kernel.map((x) => x * this.in.multiplier.value)
            );
        }
    }
}