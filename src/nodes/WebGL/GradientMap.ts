import WebGL from './WebGl';
import {
    NumberVar,
    ImageVar,
} from '../io/AbstractIOSet';

const inputs = {
    amount: {
        type: 'Number',
        default: 1,
    } as NumberVar,
    map: {
        type: 'Image',
    } as ImageVar,
};

export default class GradientMap extends WebGL<typeof inputs> {

    constructor() {
        super('GradientMap', inputs)
    }

    get frag() {
        return `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;
        uniform sampler2D u_map;

        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        uniform float amount;

        void main() {
            vec4 color = texture2D(u_image, v_texCoord);

            float luminance = (0.2126*color.r + 0.7152*color.g + 0.0722*color.b);
            vec4 mappedColor = texture2D(u_map, vec2(luminance, 0.0));

            gl_FragColor = mix(color, mappedColor, amount);
        }
        `
    }

    get amount() {
        return this.in.amount.value;
    }

    async _setParams(gl: WebGLRenderingContext, program: WebGLProgram) {
        gl.uniform1f(gl.getUniformLocation(program, "amount"), this.amount);
    }
}