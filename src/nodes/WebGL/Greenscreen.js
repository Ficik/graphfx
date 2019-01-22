import WebGL from './WebGl';

const hexColorTOvec3 = (val) => {
    const match = val.match(/#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/);
    if (match) {
        return [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255];
    } else {
        return null;
    }
};

export default class GreenScreen extends WebGL {

    constructor() {
        super('GreenScreen', {
            balance: {
                type: 'Number',
                default: 0.5,
                step: 0.1,
            },
            screen: {
                type: 'Color',
                default: '#2CD6A4',
            },
            screenWeight: {
                type: 'Number',
                default: 1,
                min: 0,
                max: 1,
                step: 0.1,
            },
            clipBlack: {
                type: 'Number',
                default: 0,
            },
            clipWhite: {
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

        uniform float balance;

        uniform vec3 screen;

        uniform float clipBlack;
        uniform float clipWhite;
        uniform float screenWeight;

        void main() {
            float pixelSat, secondaryComponents;
            vec4 sourcePixel = texture2D(u_image, v_texCoord);
            float fmin = min(min(sourcePixel.r, sourcePixel.g), sourcePixel.b);
            float fmax = max(max(sourcePixel.r, sourcePixel.g), sourcePixel.b);
            vec3 pixelPrimary = step(fmax, sourcePixel.rgb);
            secondaryComponents = dot(1.0 - pixelPrimary, sourcePixel.rgb);

            //	luminance = fmax
            float screenFmin = min(min(screen.r, screen.g), screen.b); //Min. value of RGB
            float screenFmax = max(max(screen.r, screen.g), screen.b); //Max. value of RGB
            vec3 screenPrimary = step(screenFmax, screen.rgb);
            float screenSecondaryComponents = dot(1.0 - screenPrimary, screen.rgb);
            float screenSat = screenFmax - mix(screenSecondaryComponents - screenFmin, screenSecondaryComponents / 2.0, balance);

            pixelSat = fmax - mix(secondaryComponents - fmin, secondaryComponents / 2.0, balance);

            // solid pixel if primary color component is not the same as the screen color
            float diffPrimary = dot(abs(pixelPrimary - screenPrimary), vec3(1.0));
            float solid = step(1.0, pixelSat + step(fmax, 0.1) + diffPrimary);

            /*
            Semi-transparent pixel if the primary component matches but if saturation is less
            than that of screen color. Otherwise totally transparent
            */
            float alpha = max(0.0, 1.0 - pixelSat / screenSat);
            alpha = smoothstep(clipBlack, clipWhite, alpha);
            vec4 semiTransparentPixel = vec4((sourcePixel.rgb - (1.0 - alpha) * screen.rgb * screenWeight) / max(0.00001, alpha), alpha);
            vec4 pixel = mix(semiTransparentPixel, sourcePixel, solid);
            // vec4 pixel = vec4(sourcePixel.rgb, (1.0 - alpha));

            gl_FragColor = vec4(pixel.rgb * pixel.a, min(max(pixel.a, 0.0), 1.0));
            //gl_FragColor = vec4(min(1.0, max(pixel.r, 0.0)), min(1.0, max(pixel.g, 0.0)), min(1.0, max(pixel.b, 0.0)), min(1.0, max(pixel.a, 0.0)));
        }
        `
    }

    get clipBlack() {
        return this.in.clipBlack.value;
    }

    get clipWhite() {
        return this.in.clipWhite.value;
    }

    get screenWeight() {
        return this.in.screenWeight.value;
    }

    get screen() {
        return hexColorTOvec3(this.in.screen.value);
    }

    get balance() {
        return this.in.balance.value;
    }

    _setParams(gl, program) {
        gl.uniform3f(gl.getUniformLocation(program, 'screen'), ...this.screen);
        gl.uniform1f(gl.getUniformLocation(program, 'balance'), this.balance);
        gl.uniform1f(gl.getUniformLocation(program, 'clipBlack'), this.clipBlack);
        gl.uniform1f(gl.getUniformLocation(program, 'clipWhite'), this.clipWhite);
        gl.uniform1f(gl.getUniformLocation(program, 'screenWeight'), this.screenWeight);
    }
}