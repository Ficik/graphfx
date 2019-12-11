import WebGL from './WebGl';
import {
    NumberVar
} from '../io/AbstractIOSet';

const inputs = {
    amount: {
        type: 'Number',
        default: 0.5,
    }  as NumberVar,
    size: {
        type: 'Number',
        default: 0.5,
    }  as NumberVar,
}

export default class Vignette extends WebGL<typeof inputs> {

    constructor() {
        super('Vignette', inputs)
    }

    get frag() {
        return `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;

        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        uniform float amount;
        uniform float size;

        void main() {
          vec4 color = texture2D(u_image, v_texCoord);
          float dist = distance(v_texCoord, vec2(0.5, 0.5));\
          color.rgb *= smoothstep(0.8, size * 0.799, dist * (amount + size));
          gl_FragColor = color;\
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
        gl.uniform1f(gl.getUniformLocation(program, "amount"), this.amount);
    }
}