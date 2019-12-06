import WebGL from './WebGl';
import {
    NumberVar
} from '../io/AbstractIOSet';

const inputs = {
    red: {
        type: 'Number',
        default: 1,
        min: 0,
        max: 1,
        step: 0.1,
    } as NumberVar,
    green: {
        type: 'Number',
        default: 1,
        min: 0,
        max: 1,
        step: 0.1,
    } as NumberVar,
    blue: {
        type: 'Number',
        default: 1,
        min: 0,
        max: 1,
        step: 0.1,
    } as NumberVar,
    amount: {
        type: 'Number',
        default: 0,
        min: 0,
        max: 1,
        step: 0.1,
    } as NumberVar
};

export default class Channels extends WebGL<typeof inputs> {

    constructor() {
        super('Channels', inputs)
    }

    get frag() {
        return `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;

        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        uniform vec3 u_weights;
        uniform float u_strength;

        void main() {
            vec4 pixelColor = texture2D(u_image, v_texCoord).rgba;
            vec3 weights = u_weights / max((u_weights.r + u_weights.g + u_weights.b), 1.0);
            float grey = dot(pixelColor.rgb, weights);

            gl_FragColor = vec4(
                mix(pixelColor.r, grey, u_strength),
                mix(pixelColor.g, grey, u_strength),
                mix(pixelColor.b, grey, u_strength),
                pixelColor.a);
        }
        `
    }

    _setParams(gl, program) {
        gl.uniform3f(gl.getUniformLocation(program, "u_weights"), this.in.red.value, this.in.green.value, this.in.blue.value);
        gl.uniform1f(gl.getUniformLocation(program, 'u_strength'), this.in.amount.value);
    }
}