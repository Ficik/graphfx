import WebGL from './WebGl';


export default class BrightnessContrast extends WebGL {

    constructor() {
        super('BrightnessContrast', {
            brightness: {
                type: 'Number',
                default: 1,
            },
            contrast: {
                type: 'Number',
                default: 1,
            },
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
            vec4 pixelColor = texture2D(u_image, v_texCoord);
            vec3 c = pixelColor.rgb * u_brightnessContrast[0];
            gl_FragColor = vec4(
                clamp(
                    (c - 0.5) * u_brightnessContrast[1] + 0.5,
                0.0, 1.0),
                pixelColor.a
            );
        }
        `
    }

    get contrast() {
        return this.in.contrast.value
    }

    get brightness() {
        return this.in.brightness.value;
    }

    _setParams(gl, program) {
        gl.uniform2f(gl.getUniformLocation(program, "u_brightnessContrast"), this.brightness, this.contrast);
    }
}