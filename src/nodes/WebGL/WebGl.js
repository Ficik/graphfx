import Node from '../Node';
import {createCanvas, mediaSize, paintToCanvas} from '../canvas';

export default class WebGL extends Node {

    constructor(name, inputs={}) {
        super(name, Object.assign({
            image: {
                type: 'Image',
            },
        }, inputs), {
            image: {
                type: 'Image',
            },
            width: {
                type: 'Number',
            },
            height: {
                type: 'Number',
            }
        });
    }

    destroy() {
        this.canvas = null;
        this.program = null;
        super.destroy();
    }

    get vert() {
        return `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;

        uniform vec2 u_resolution;

        varying vec2 v_texCoord;

        void main() {
           // convert the rectangle from pixels to 0.0 to 1.0
           vec2 zeroToOne = a_position / u_resolution;

           // convert from 0->1 to 0->2
           vec2 zeroToTwo = zeroToOne * 2.0;

           // convert from 0->2 to -1->+1 (clipspace)
           vec2 clipSpace = zeroToTwo - 1.0;

           gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

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

    fragShader(gl) {
        var shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, this.frag);
        gl.compileShader(shader);

        if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
          var info = gl.getShaderInfoLog(shader);
          throw 'Could not compile WebGL program. \n\n' + info;
        }
        return shader;
    }

    vertShader(gl) {
        var shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shader, this.vert);
        gl.compileShader(shader);

        if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
          var info = gl.getShaderInfoLog(shader);
          throw 'Could not compile WebGL program. \n\n' + info;
        }
        return shader;
    }

    /**
     *
     * @param {WebGLRenderingContext} gl
     */
    compileProgram(gl) {
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

    createTexture(gl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


        return texture;
    }

    _setParams(gl, program) {

    }

    setup() {
        if (!this.canvas) {
            this.program = null;
            this.canvas = createCanvas(0, 0);
        }
        const gl = this.canvas.getContext('webgl');
        if (!this.program) {
            this.program = this.compileProgram(gl);
            gl.useProgram(this.program);
            this.createTexture(gl);
        }
    }

    async _update() {
        const image = this.in.image.value;
        if (!image) return;
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

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);


        const positionLocation = gl.getAttribLocation(program, "a_position");
        const texcoordLocation = gl.getAttribLocation(program, "a_texCoord");
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

        if (this.image) {
            // Upload the image into the texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        }


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

        // set the resolution
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

        this._setParams(gl, program);

        // Draw the rectangle.
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        const result = await createImageBitmap(canvas);
        this.out.image.value = result;
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