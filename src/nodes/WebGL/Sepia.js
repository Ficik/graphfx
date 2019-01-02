import WebGL from './WebGl';


export default class BrightnessContrast extends WebGL {

    constructor() {
        super({
            amount: 'Number',
        })
    }

    get frag() {
        return `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;

        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        uniform float amount;

        void main() {
            vec3 color = texture2D(u_image, v_texCoord).rgb;
            float r = color.r;
            float g = color.g;
            float b = color.b;

            color.r = min(1.0, (r * (1.0 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount)));
            color.g = min(1.0, (r * 0.349 * amount) + (g * (1.0 - (0.314 * amount))) + (b * 0.168 * amount));
            color.b = min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1.0 - (0.869 * amount))));

            gl_FragColor = vec4(color, 1);
        }
        `
    }

    get amount() {
        return this.in.amount.value || 0;
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