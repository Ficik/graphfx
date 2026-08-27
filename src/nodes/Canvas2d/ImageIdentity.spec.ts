import {describe, expect, it} from 'vitest';
import ImageIdentity from './ImageIdentity';
import {expectPixelsToMatch, loadFixture} from '../../../tests/helpers/image';
import {nextOutput} from '../../../tests/helpers/node';
import {
    poisonOnRecycle,
    pooledCanvasFromFixture,
    releaseOnNextMicrotask,
} from '../../../tests/helpers/canvasPool';

describe('ImageIdentity', () => {
    it('copies the source through an HTML canvas and image', async () => {
        const source = await loadFixture('canvas2d/flip/gradient-rect.png');
        const identity = new ImageIdentity();
        const output = nextOutput<HTMLImageElement>(
            identity.out.image,
            (value) => value instanceof HTMLImageElement,
        );

        identity.in.image.value = source;
        const result = await output;

        expect(result).not.toBe(source);
        expect(result).toBeInstanceOf(HTMLImageElement);
        expectPixelsToMatch(result, source);
        identity.destroy();
    });

    it('retains its pooled input across the first async boundary', async () => {
        const expected = await loadFixture('canvas2d/flip/gradient-rect.png');
        const source = await pooledCanvasFromFixture('canvas2d/flip/gradient-rect.png');
        const poison = poisonOnRecycle(source);
        const identity = new ImageIdentity();
        const output = nextOutput<HTMLImageElement>(identity.out.image);

        try {
            identity.in.image.value = source;
            await releaseOnNextMicrotask(source);
            const result = await output;

            poison.assert();
            expectPixelsToMatch(result, expected);
        } finally {
            identity.destroy();
            poison.cleanup();
        }
    });
});
