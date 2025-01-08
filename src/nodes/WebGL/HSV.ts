import WebGL from './WebGl';
import {
    NumberVar
} from '../io/AbstractIOSet';

const inputs = {
    hue: {
        type: 'Number',
        default: 0,
    } as NumberVar,
    saturation: {
        type: 'Number',
        default: 1,
    } as NumberVar,
    value: {
        type: 'Number',
        default: 1,
    } as NumberVar
};


export default class HSV extends WebGL<typeof inputs> {

    constructor() {
        super('HSV', inputs)
    }

    get frag() {
        return `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;

        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        uniform vec3 u_shift;

        vec3 rgb2hsv(vec3 c) {
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }

        vec3 hsv2rgb(vec3 c) {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        void main() {
            vec4 texColor = texture2D(u_image, v_texCoord);
            vec3 c = rgb2hsv(texColor.rgb);
            gl_FragColor = vec4(
                hsv2rgb(vec3(c.x + u_shift.x, c.y * u_shift.y, c.z * u_shift.z)),
                texColor.a
            );
        }
        `
    }

    get hue() {
        return ((this.in.hue.value) % 360) / 360;
    }

    get saturation() {
        return this.in.saturation.value;
    }

    get value() {
        return this.in.value.value;
    }

    _setParams(gl, program) {
        gl.uniform3f(gl.getUniformLocation(program, "u_shift"), this.hue, this.saturation, this.value);
    }
}