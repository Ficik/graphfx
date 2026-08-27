import {describe, expect, it} from 'vitest';
import Rotate from './Rotate';
import {PoolCanvas} from '../../canvas/CanvasPool';
import {expectPixelsToMatch, loadFixture} from '../../../tests/helpers/image';
import {nextOutput} from '../../../tests/helpers/node';
import {
    poisonOnRecycle,
    pooledCanvasFromFixture,
    releaseOnNextMicrotask,
} from '../../../tests/helpers/canvasPool';

const render = async (angle: number, width: number, height: number) => {
    const source = await loadFixture('canvas2d/flip/gradient-rect.png');
    const rotate = new Rotate();
    const output = nextOutput<PoolCanvas<OffscreenCanvas>>(
        rotate.out.image,
        (value) => Boolean(value && value.width === width && value.height === height),
    );

    rotate.in.angle.value = angle;
    rotate.in.image.value = source;
    const result = await output;

    expect(rotate.out.width.value).toBe(width);
    expect(rotate.out.height.value).toBe(height);
    return {result, rotate};
};

describe('Rotate', () => {
    it.each([
        {angle: 90, width: 64, height: 96, expected: 'gradient-rect-90.png'},
    ])('rotates $angle degrees and expands the bounds', async ({angle, width, height, expected}) => {
        const expectedImage = await loadFixture(`canvas2d/rotate/${expected}`);
        const {result, rotate} = await render(angle, width, height);

        expectPixelsToMatch(result, expectedImage);

        result.release();
        rotate.destroy();
    });

    // Floating-point bounds are truncated to 95x63 instead of 96x64.
    it.todo('preserves the source dimensions without clipping at 180 degrees');

    it('passes the source through at zero degrees', async () => {
        const source = await loadFixture('canvas2d/flip/gradient-rect.png');
        const rotate = new Rotate();
        const output = nextOutput<HTMLImageElement>(
            rotate.out.image,
            (value) => value === source,
        );

        rotate.in.image.value = source;

        expect(await output).toBe(source);
        expect(rotate.out.width.value).toBe(96);
        expect(rotate.out.height.value).toBe(64);
        rotate.destroy();
    });

    it('retains its pooled input across the first async boundary', async () => {
        const expected = await loadFixture('canvas2d/rotate/gradient-rect-90.png');
        const source = await pooledCanvasFromFixture('canvas2d/flip/gradient-rect.png');
        const poison = poisonOnRecycle(source);
        const rotate = new Rotate();
        const output = nextOutput<PoolCanvas<OffscreenCanvas>>(rotate.out.image);
        let result: PoolCanvas<OffscreenCanvas>;

        try {
            rotate.in.angle.value = 90;
            rotate.in.image.value = source;
            await releaseOnNextMicrotask(source);
            result = await output;

            poison.assert();
            expectPixelsToMatch(result, expected);
        } finally {
            if (result) {
                result.release();
            }
            rotate.destroy();
            poison.cleanup();
        }
    });
});
