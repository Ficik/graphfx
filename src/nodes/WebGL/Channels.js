import WebGL from './WebGl';


export default class Channels extends WebGL {

    constructor() {
        super('Greyscale by channel', {
            red: {
                type: 'Number',
                default: 1,
                min: 0,
                max: 1,
                step: 0.1,
            },
            green: {
                type: 'Number',
                default: 1,
                min: 0,
                max: 1,
                step: 0.1,
            },
            blue: {
                type: 'Number',
                default: 1,
                min: 0,
                max: 1,
                step: 0.1,
            }
        })
    }

    get frag() {
        return `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;

        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        uniform vec3 u_weights;

        void main() {
            vec4 pixelColor = texture2D(u_image, v_texCoord).rgba;
            vec3 weights = u_weights / max((u_weights.r + u_weights.g + u_weights.b), 1.0);
            float grey = dot(pixelColor.rgb, weights);

            gl_FragColor = vec4(grey, grey, grey, pixelColor.a);
        }
        `
    }

    _setParams(gl, program) {
        gl.uniform3f(gl.getUniformLocation(program, "u_weights"), this.in.red.value, this.in.green.value, this.in.blue.value);
    }
}