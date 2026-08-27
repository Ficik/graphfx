import {PoolCanvas} from '../../src/canvas/CanvasPool';
import WebGL from '../../src/nodes/WebGL/WebGl';
import {expectPixelsToMatch, loadFixture} from './image';
import {nextOutput} from './node';

export const renderWebGL = async (
    node: WebGL<any>,
    values: Record<string, any> = {},
    fixture = 'canvas2d/flip/gradient-rect.png',
) => {
    const image = await loadFixture(fixture);
    const output = nextOutput<PoolCanvas<OffscreenCanvas>>(node.out.image);

    for (const [name, value] of Object.entries(values)) {
        node.in[name].value = value;
    }
    node.in.image.value = image;

    const result = await output;
    return {image, result};
};

export const releaseWebGLResult = (
    node: WebGL<any>,
    result: PoolCanvas<OffscreenCanvas>,
) => {
    result.release();
    node.destroy();
};

export const expectWebGLToMatch = async (
    node: WebGL<any>,
    expectedFixture: string,
    values: Record<string, any> = {},
    sourceFixture = 'canvas2d/flip/gradient-rect.png',
    tolerance = 2,
) => {
    const expected = await loadFixture(expectedFixture);
    const {image, result} = await renderWebGL(node, values, sourceFixture);

    expectPixelsToMatch(result, expected, tolerance);
    if (node.out.width.value !== image.width || node.out.height.value !== image.height) {
        throw new Error(
            `Expected ${image.width}x${image.height} output dimensions, got ` +
            `${node.out.width.value}x${node.out.height.value}`,
        );
    }

    return result;
};
