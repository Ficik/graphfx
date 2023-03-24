import Node from '../Node';
import {createCanvas, mediaSize, paintToCanvas} from '../canvas';
import {merge} from '../../utils';
import {canvasPool2D, PoolCanvas} from '../../canvas/CanvasPool';
import {
    Variables,
    ImageVar,
    NumberVar
} from '../io/AbstractIOSet';

const inputs = {
    image: {
        type: 'Image',
    } as ImageVar,
};

const outputs = {
    image: {
        type: 'Image',
    } as ImageVar,
    width: {
        type: 'Number',
    } as NumberVar,
    height: {
        type: 'Number',
    } as NumberVar
}

export default class WebGL<I extends Variables> extends Node<I & (typeof inputs), (typeof outputs)> {

    canvas: HTMLCanvasElement
    program: WebGLProgram

    constructor(name, inputDefinition: I) {
        super(
            name,
            merge(inputs, inputDefinition),
            outputs,
        )
    }

    destroy() {
        this.canvas = null;
        this.program = null;
        super.destroy();
    }

    get vert() {
        return `
        precision mediump float;
        attribute vec2 a_position;
        attribute vec2 a_texCoord;

        uniform vec2 u_resolution;
        uniform vec2 u_textureSize;
        uniform float u_flip_y;

        varying vec2 v_texCoord;

        void main() {
           // convert the rectangle from pixels to 0.0 to 1.0
           vec2 zeroToOne = a_position / u_resolution;

           // convert from 0->1 to 0->2
           vec2 zeroToTwo = zeroToOne * 2.0;

           // convert from 0->2 to -1->+1 (clipspace)
           vec2 clipSpace = zeroToTwo - 1.0;

           gl_Position = vec4(clipSpace * vec2(1, u_flip_y), 0, 1);

           // pass the texCoord to the fragment shader
           // The GPU will interpolate this value between points.
           v_texCoord = a_texCoord;
        }
        `;
    }

    get frag() {
        return `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;

        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        void main() {
           gl_FragColor = texture2D(u_image, v_texCoord).bgra;
        }
        `
    }

    fragShader(gl: WebGLRenderingContext) {
        var shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, this.frag);
        gl.compileShader(shader);

        if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
          var info = gl.getShaderInfoLog(shader);
          throw 'Could not compile WebGL program. \n\n' + info;
        }
        return shader;
    }

    vertShader(gl: WebGLRenderingContext) {
        var shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shader, this.vert);
        gl.compileShader(shader);

        if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
          var info = gl.getShaderInfoLog(shader);
          throw 'Could not compile WebGL program. \n\n' + info;
        }
        return shader;
    }

    compileProgram(gl: WebGLRenderingContext) {
        const program = gl.createProgram();

        gl.attachShader(program, this.vertShader(gl));
        gl.attachShader(program, this.fragShader(gl));
        gl.linkProgram(program);

        if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
            var info = gl.getProgramInfoLog(program);
            throw 'Could not compile WebGL program. \n\n' + info;
        }

        return program;
    }

    get image() {
        return this.in.image.value;
    }

    createTexture(gl: WebGLRenderingContext) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


        return texture;
    }

    async createTextures(gl: WebGLRenderingContext, program: WebGLProgram) {
        let i = 0;
        type Texture = {
            i: number,
            tex: WebGLTexture,
            name: string,
            location: WebGLUniformLocation,
        };
        const textures:Texture[] = [];
        for (let inputName of Object.keys(this.in.variables)) {
            if (this.in[inputName].type === 'Image' && this.in[inputName].value) {
                textures.push({
                    i,
                    tex: this.createTexture(gl),
                    name: inputName,
                    location:  gl.getUniformLocation(program, `u_${inputName}`),
                })
                i+=1;
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, await createImageBitmap(<PoolCanvas<any>>this.in[inputName].value));
            }
        }
        return textures;
    }

    _createFrameBuffer(gl: WebGLRenderingContext, {width, height}) {
        const texture = this.createTexture(gl);

        const frameBuffer = gl.createFramebuffer();
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        return {frameBuffer, texture};
    }

    _passes() {
        return [
            (
                gl: WebGLRenderingContext,
                program: WebGLProgram,
                // image
            ) => {
                this._setParams(gl, program);
            },
        ]
    }

    _setParams(gl: WebGLRenderingContext, program: WebGLProgram) {
    }

    setup() {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas')
            this.program = null;
        }
        const gl = this.canvas.getContext('webgl');
        if (!this.program) {
            this.program = this.compileProgram(gl);
            gl.useProgram(this.program);
        }
    }

    async _update() {

        const image = <PoolCanvas<any>>this.in.image.value;
        if (!image) {
            return;
        }
        if (image.acquire) {
            image.acquire();
        }
        const {width, height} = mediaSize(image);
        if (width === 0 || height === 0) {
            return;
        }

        this.setup();
        const canvas = this.canvas;
        canvas.width = width;
        canvas.height = height;

        const gl = canvas.getContext('webgl');
        const program = this.program;

        const frameBuffers = [
            this._createFrameBuffer(gl, {width, height}),
            this._createFrameBuffer(gl, {width, height}),
        ];
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);


        const positionLocation = gl.getAttribLocation(program, "a_position");
        const texcoordLocation = gl.getAttribLocation(program, "a_texCoord");
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const flipLocation = gl.getUniformLocation(program, "u_flip_y");

        const textures = await this.createTextures(gl, program);

        const texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,
        ]), gl.STATIC_DRAW);


        gl.enableVertexAttribArray(positionLocation);
        const positionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        this.setRectangle(gl, 0, 0, width, height);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset);

        // Turn on the teccord attribute
        gl.enableVertexAttribArray(texcoordLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            texcoordLocation, size, type, normalize, stride, offset);

        const passes = this._passes();
        for (let iter = 0; iter < passes.length; iter++) {
            const frameBuffer = frameBuffers[iter%2];
            if (iter === passes.length -1) { // last
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.uniform1f(flipLocation, -1);
            } else {
                gl.uniform1f(flipLocation, 1);
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
            }



            passes[iter](gl, program);
            // set the resolution
            gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform2f(gl.getUniformLocation(program, "u_textureSize"), width, height);

            for (let {i, tex, location, name} of textures) {
                // console.log('bind', i, name, this.in[name].value, location, [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3][i]);
                if (this.in[name].value) {
                    if (name === 'image' && iter > 0) {
                        gl.activeTexture([gl.TEXTURE2, gl.TEXTURE3][i]);
                        gl.bindTexture(gl.TEXTURE_2D, frameBuffers[(iter-1)%2].texture);
                        gl.uniform1i(location, i + 2);
                    } else {
                        gl.uniform1i(location, i + 2);
                        gl.activeTexture([gl.TEXTURE2, gl.TEXTURE3][i]);
                        gl.bindTexture(gl.TEXTURE_2D, tex);
                    }
                }
            }

            // Draw the rectangle.
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.bindTexture(gl.TEXTURE_2D, frameBuffer.texture);
        }

        const resultCanvas = canvasPool2D.createCanvas();
        resultCanvas.width = 1;
        resultCanvas.height = 1;
        resultCanvas.acquire();
        resultCanvas.width = canvas.width;
        resultCanvas.height = canvas.height;
        const ctx = resultCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0);

        if (image.release) {
            image.release();
        }
        if (this.out.image.value && (<PoolCanvas<any>>this.out.image.value).release) {
            (<PoolCanvas<any>>this.out.image.value).release();
        }
        this.out.image.value = resultCanvas;
        if (this.out.width.value !== this.out.image.value.width) {
            this.out.width.value = this.out.image.value.width;
        }
        if (this.out.height.value !== this.out.image.value.height) {
            this.out.height.value = this.out.image.value.height;
        }
    }

    setRectangle(gl, x, y, width, height) {
        var x1 = x;
        var x2 = x + width;
        var y1 = y;
        var y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
           x1, y1,
           x2, y1,
           x1, y2,
           x1, y2,
           x2, y1,
           x2, y2,
        ]), gl.STATIC_DRAW);
      }
}