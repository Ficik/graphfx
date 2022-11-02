import WebGL from './WebGl';
import {
    NumberVar
} from '../io/AbstractIOSet';

const inputs = {
    dx: {
        type: 'Number',
        default: 0,
    }  as NumberVar,
    dy: {
        type: 'Number',
        default: 0,
    }  as NumberVar,
}

export default class Edge extends WebGL<typeof inputs> {

    constructor() {
        super('Edge', inputs)
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

        
        uniform vec2 delta;

        void main() {
            vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

            gl_FragColor = vec4(
                (
                  (
                    texture2D(u_image, v_texCoord + onePixel * vec2(0, 0)) - 
                    texture2D(u_image, v_texCoord + onePixel * delta)
                  ) / 2.0 + 0.5
                ).xyz,
                1
            );
        }
        `
    }

    get dx() {
        return this.in.dx.value;
    }

    get dy() {
        return this.in.dy.value;
    }

    /**
     *
     * @param {WebGLRenderingContext} gl
     * @param {*} program
     */
    _setParams(gl, program) {
        gl.uniform2f(gl.getUniformLocation(program, "delta"), this.dx, this.dy);
    }
}
