import {describe, it} from 'vitest';
import BrightnessContrast from './BrightnessContrast';
import {PoolCanvas} from '../../canvas/CanvasPool';
import {expectPixelsToMatch, loadFixture} from '../../../tests/helpers/image';
import {nextOutput} from '../../../tests/helpers/node';
import {
    poisonOnRecycle,
    pooledCanvasFromFixture,
    releaseOnNextMicrotask,
} from '../../../tests/helpers/canvasPool';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('BrightnessContrast', () => {
    it('adjusts brightness and contrast while preserving the image dimensions', async () => {
        const node = new BrightnessContrast();
        const result = await expectWebGLToMatch(
            node,
            'webgl/brightness-contrast.png',
            {
                brightness: 0.75,
                contrast: 1.35,
            },
        );

        releaseWebGLResult(node, result);
    });

    it('retains its pooled input across texture creation', async () => {
        const expected = await loadFixture('webgl/brightness-contrast.png');
        const image = await pooledCanvasFromFixture('canvas2d/flip/gradient-rect.png');
        const poison = poisonOnRecycle(image);
        const node = new BrightnessContrast();
        const output = nextOutput<PoolCanvas<OffscreenCanvas>>(node.out.image);
        let result: PoolCanvas<OffscreenCanvas>;

        try {
            node.in.brightness.value = 0.75;
            node.in.contrast.value = 1.35;
            node.in.image.value = image;
            await releaseOnNextMicrotask(image);
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
