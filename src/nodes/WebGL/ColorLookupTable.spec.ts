import {describe, it} from 'vitest';
import ColorLookupTable from './ColorLookupTable';
import {PoolCanvas} from '../../canvas/CanvasPool';
import {expectPixelsToMatch, loadFixture} from '../../../tests/helpers/image';
import {nextOutput} from '../../../tests/helpers/node';
import {
    poisonOnRecycle,
    pooledCanvasFromFixture,
    pooledCanvasFromImage,
    releaseOnNextMicrotask,
} from '../../../tests/helpers/canvasPool';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

const loadDefaultMap = async (node: ColorLookupTable) => {
    const map = node.in.map.value as HTMLImageElement;
    await map.decode();
    return map;
};

describe('ColorLookupTable', () => {
    it('applies the bundled color lookup table', async () => {
        const node = new ColorLookupTable();
        const map = await loadDefaultMap(node);
        const result = await expectWebGLToMatch(node, 'webgl/color-lookup-table.png', {
            amount: 0.75,
            map,
        });
        releaseWebGLResult(node, result);
    });

    it('retains both pooled textures across asynchronous bitmap creation', async () => {
        const expected = await loadFixture('webgl/color-lookup-table.png');
        const node = new ColorLookupTable();
        const defaultMap = await loadDefaultMap(node);
        const image = await pooledCanvasFromFixture('canvas2d/flip/gradient-rect.png');
        const map = pooledCanvasFromImage(defaultMap);
        const poison = poisonOnRecycle(image, map);
        const output = nextOutput<PoolCanvas<OffscreenCanvas>>(node.out.image);
        let result: PoolCanvas<OffscreenCanvas>;

        try {
            node.in.amount.value = 0.75;
            node.in.map.value = map;
            node.in.image.value = image;
            await releaseOnNextMicrotask(image, map);
            result = await output;

            poison.assert();
            expectPixelsToMatch(result, expected, 2);
        } finally {
            if (result) {
                result.release();
            }
            node.destroy();
            poison.cleanup();
        }
    });
});
