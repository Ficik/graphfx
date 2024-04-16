import WebGL from './WebGl';
import {
    ImageVar,
    NumberVar,
} from '../io/AbstractIOSet';
import {canvasPool2D} from "graphfx/src/canvas/CanvasPool";
import {Variables} from "graphfx/src/nodes/io/AbstractIOSet";
import {mediaSize} from "../canvas";

const inputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    shadow: {
        type: 'Number',
        min: 0,
        max: 255,
        default: 0
    } as NumberVar,
    gamma: {
        type: 'Number',
        min: 0.1,
        max: 9.9,
        default: 1,
        step: 0.1,
    } as NumberVar,
    highlight: {
        type: 'Number',
        min: 0,
        max: 255,
        default: 255
    } as NumberVar,
    dark: {
        type: 'Number',
        min: 0,
        max: 255,
        default: 0
    } as NumberVar,
    light: {
        type: 'Number',
        min: 0,
        max: 255,
        default: 255
    } as NumberVar,
}

export abstract class LevelsAbstract<INPUTS extends Variables> extends WebGL<INPUTS> {
    protected constructor(name: string, inputs: INPUTS) {
        super(name, inputs);
    }

    get frag() {
        return `
            precision mediump float;
            
            uniform sampler2D u_image;
            uniform vec2 u_resolution;
            uniform float u_shadow;
            uniform float u_highlight;
            uniform float u_gamma;
            uniform float u_dark;
            uniform float u_light;
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution;
                uv.y = 1.0 - uv.y;  // flip the y-coordinate
                vec4 color = texture2D(u_image, uv);
                color.rgb = (color.rgb - vec3(u_shadow / 255.0)) * (1.0 / ((u_highlight - u_shadow) / 255.0));
                color.rgb = (color.rgb - 0.5) * u_gamma + 0.5;
                color.rgb = color.rgb * ((u_light - u_dark) / 255.0) + vec3(u_dark / 255.0);
                color.rgb = clamp(color.rgb, 0.0, 1.0);
                gl_FragColor = color;
            }
        `;
    }

    _setParams(gl: WebGLRenderingContext, program: WebGLProgram) {
        const image = this.in.image.value;
        // @ts-ignore
        const {width, height} = mediaSize(image)
        const canvas = canvasPool2D.createCanvas();
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(image as CanvasImageSource | OffscreenCanvas, 0, 0);
        this._setParamsWithCanvas(gl, program, canvas);
    }

    _setParamsWithCanvas(gl: WebGLRenderingContext, program: WebGLProgram, canvas: OffscreenCanvas | HTMLCanvasElement) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

        gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
        gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
    }
}

export default class Levels extends LevelsAbstract<typeof inputs> {

    constructor() {
        super('Levels', inputs)
    }

    _setParamsWithCanvas(gl: WebGLRenderingContext, program: WebGLProgram, canvas: OffscreenCanvas | HTMLCanvasElement) {
        super._setParamsWithCanvas(gl, program, canvas);
        gl.uniform1f(gl.getUniformLocation(program, 'u_shadow'), this.in.shadow.value);
        gl.uniform1f(gl.getUniformLocation(program, 'u_highlight'), this.in.highlight.value);
        gl.uniform1f(gl.getUniformLocation(program, 'u_gamma'), this.in.gamma.value);
        gl.uniform1f(gl.getUniformLocation(program, 'u_dark'), this.in.dark.value);
        gl.uniform1f(gl.getUniformLocation(program, 'u_light'), this.in.light.value);
    }
}