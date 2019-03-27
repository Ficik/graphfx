import WebGL from './WebGl';


export default class Blur extends WebGL {

    constructor() {
        super('Blur', {
            amount: {
                type: 'Number',
                default: 0,
            },
        })
    }

    _passes() {
        const passes = Array(this.in.amount.value)
            .fill(null)
            .map((x, i) => (gl, program) => this._setParams(gl, program));
        return passes;
    }

    get frag() {
        return `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;

        uniform vec2 u_resolution;
        uniform vec2 u_textureSize;

        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        uniform float kernel[9];

        void main() {
            vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

            float weight = kernel[0] +
                kernel[1] +
                kernel[2] +
                kernel[3] +
                kernel[4] +
                kernel[5] +
                kernel[6] +
                kernel[7] +
                kernel[8];

            vec4 colorSum =
                texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * kernel[0] +
                texture2D(u_image, v_texCoord + onePixel * vec2(0, -1)) * kernel[1] +
                texture2D(u_image, v_texCoord + onePixel * vec2(1, -1)) * kernel[2] +
                texture2D(u_image, v_texCoord + onePixel * vec2(-1, 0)) * kernel[3] +
                texture2D(u_image, v_texCoord + onePixel * vec2(0, 0)) * kernel[4] +
                texture2D(u_image, v_texCoord + onePixel * vec2(1, 0)) * kernel[5] +
                texture2D(u_image, v_texCoord + onePixel * vec2(-1, 1)) * kernel[6] +
                texture2D(u_image, v_texCoord + onePixel * vec2(0, 1)) * kernel[7] +
                texture2D(u_image, v_texCoord + onePixel * vec2(1, 1)) * kernel[8];

            gl_FragColor = colorSum / weight;
        }
        `
    }

    get amount() {
        return this.in.amount.value;
    }

    /**
     *
     * @param {WebGLRenderingContext} gl
     * @param {*} program
     */
    _setParams(gl, program) {
        gl.uniform1fv(gl.getUniformLocation(program, 'kernel'), [
            0.045, 0.122, 0.045,
            0.122, 0.332, 0.122,
            0.045, 0.122, 0.045
        ]);
    }
}