import WebGL from './WebGl';


export default class BrightnessContrast extends WebGL {

    constructor() {
        super('BrightnessContrast', {
            brightness: 'Number',
            contrast: 'Number',
        })
    }

    get frag() {
        return `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;

        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        uniform vec2 u_brightnessContrast;

        void main() {
            vec3 c = texture2D(u_image, v_texCoord).rgb * u_brightnessContrast[0];
            gl_FragColor = vec4(
                clamp(
                    (c - 0.5) * u_brightnessContrast[1] + 0.5,
                0.0, 1.0),
                1
            );
        }
        `
    }

    get contrast() {
        return this.in.contrast.value || 1;
    }

    get brightness() {
        return this.in.brightness.value || 1;
    }

    _setParams(gl, program) {
        gl.uniform2f(gl.getUniformLocation(program, "u_brightnessContrast"), this.brightness, this.contrast);
    }
}