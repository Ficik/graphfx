import WebGL from './WebGl';
import {lookup} from './assets';
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
        default: lookup,
    } as ImageVar,
};

export default class ColorLookupTable extends WebGL<typeof inputs> {

    constructor() {
        super('ColorLookupTable', inputs)
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
            vec4 textureColor = clamp(texture2D(u_image, v_texCoord), 0.0, 1.0);
            mediump vec2 quad1;
            float blueColor = textureColor.b * 63.0;
            quad1.y = floor(floor(blueColor) / 8.0);
            quad1.x = floor(blueColor) - (quad1.y * 8.0);

            mediump vec2 quad2;
            quad2.y = floor(ceil(blueColor) / 8.0);
            quad2.x = ceil(blueColor) - (quad2.y * 8.0);

            highp vec2 texPos1;
            texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
            texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);

            highp vec2 texPos2;
            texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
            texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);

            lowp vec4 newColor1 = texture2D(u_map, texPos1);
            lowp vec4 newColor2 = texture2D(u_map, texPos2);

            lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));

            // gl_FragColor = mix(color, mappedColor, amount);
            gl_FragColor = mix(textureColor, newColor, amount);
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