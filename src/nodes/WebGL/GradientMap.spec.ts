import {describe, it} from 'vitest';
import GradientMap from './GradientMap';
import {PoolCanvas} from '../../canvas/CanvasPool';
import {expectPixelsToMatch, loadFixture} from '../../../tests/helpers/image';
import {nextOutput} from '../../../tests/helpers/node';
import {
    poisonOnRecycle,
    pooledCanvasFromFixture,
    releaseOnNextMicrotask,
} from '../../../tests/helpers/canvasPool';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('GradientMap', () => {
    it('maps source luminance through a color gradient', async () => {
        const node = new GradientMap();
        const map = await loadFixture('webgl/gradient-map.png');
        const result = await expectWebGLToMatch(node, 'webgl/gradient-map-result.png', {
            amount: 1,
            map,
        });
        releaseWebGLResult(node, result);
    });

    it('retains both pooled textures across asynchronous bitmap creation', async () => {
        const expected = await loadFixture('webgl/gradient-map-result.png');
        const image = await pooledCanvasFromFixture('canvas2d/flip/gradient-rect.png');
        const map = await pooledCanvasFromFixture('webgl/gradient-map.png');
        const poison = poisonOnRecycle(image, map);
        const node = new GradientMap();
        const output = nextOutput<PoolCanvas<OffscreenCanvas>>(node.out.image);
        let result: PoolCanvas<OffscreenCanvas>;

        try {
            node.in.amount.value = 1;
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
