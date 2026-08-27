import {describe, expect, it} from 'vitest';
import Resize from './Resize';
import {PoolCanvas} from '../../canvas/CanvasPool';
import {expectPixelsToMatch, loadFixture} from '../../../tests/helpers/image';
import {nextOutput} from '../../../tests/helpers/node';
import {
    poisonOnRecycle,
    pooledCanvasFromFixture,
    releaseOnNextMicrotask,
} from '../../../tests/helpers/canvasPool';

describe('Resize', () => {
    it('covers and center-crops to the requested aspect ratio', async () => {
        const source = await loadFixture('canvas2d/flip/gradient-rect.png');
        const expectedImage = await loadFixture('canvas2d/resize/gradient-rect-square.png');
        const resize = new Resize();
        const output = nextOutput<PoolCanvas<OffscreenCanvas>>(
            resize.out.image,
            (value) => Boolean(value && value.width === 64 && value.height === 64),
        );

        resize.in.width.value = 64;
        resize.in.height.value = 64;
        resize.in.image.value = source;
        const result = await output;

        expect(resize.out.width.value).toBe(64);
        expect(resize.out.height.value).toBe(64);
        expectPixelsToMatch(result, expectedImage);

        result.release();
        resize.destroy();
    });

    it('retains its pooled input across the first async boundary', async () => {
        const expected = await loadFixture('canvas2d/resize/gradient-rect-square.png');
        const source = await pooledCanvasFromFixture('canvas2d/flip/gradient-rect.png');
        const poison = poisonOnRecycle(source);
        const resize = new Resize();
        const output = nextOutput<PoolCanvas<OffscreenCanvas>>(resize.out.image);
        let result: PoolCanvas<OffscreenCanvas>;

        try {
            resize.in.width.value = 64;
            resize.in.height.value = 64;
            resize.in.image.value = source;
            await releaseOnNextMicrotask(source);
            result = await output;

            poison.assert();
            expectPixelsToMatch(result, expected);
        } finally {
            if (result) {
                result.release();
            }
            resize.destroy();
            poison.cleanup();
        }
    });
});
