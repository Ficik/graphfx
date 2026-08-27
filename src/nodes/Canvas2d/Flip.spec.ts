import {describe, expect, it} from 'vitest';
import Flip from './Flip';
import {PoolCanvas} from '../../canvas/CanvasPool';
import {expectPixelsToMatch, loadFixture} from '../../../tests/helpers/image';
import {nextOutput} from '../../../tests/helpers/node';
import {
    poisonOnRecycle,
    pooledCanvasFromFixture,
    releaseOnNextMicrotask,
} from '../../../tests/helpers/canvasPool';

const render = async (horizontal: boolean, vertical: boolean) => {
    const source = await loadFixture('canvas2d/flip/gradient-rect.png');
    const flip = new Flip();
    flip.in.horizontal.value = horizontal;
    flip.in.vertical.value = vertical;

    const output = new Promise<PoolCanvas<OffscreenCanvas>>((resolve) => {
        flip.out.image.onchange((value) => {
            if (value) {
                resolve(value as PoolCanvas<OffscreenCanvas>);
            }
        });
    });

    flip.in.image.value = source;
    const result = await output;

    expect(result).toBeInstanceOf(OffscreenCanvas);
    expect(flip.out.width.value).toBe(source.width);
    expect(flip.out.height.value).toBe(source.height);

    return {flip, result};
};

describe('Flip', () => {
    it.each([
        {
            name: 'keeps the original orientation by default',
            horizontal: false,
            vertical: false,
            expected: 'gradient-rect.png',
        },
        {
            name: 'flips horizontally',
            horizontal: true,
            vertical: false,
            expected: 'gradient-rect-horizontal.png',
        },
        {
            name: 'flips vertically',
            horizontal: false,
            vertical: true,
            expected: 'gradient-rect-vertical.png',
        },
        {
            name: 'flips both axes',
            horizontal: true,
            vertical: true,
            expected: 'gradient-rect-both.png',
        },
    ])('$name', async ({horizontal, vertical, expected}) => {
        const expectedImage = await loadFixture(`canvas2d/flip/${expected}`);
        const {flip, result} = await render(horizontal, vertical);

        expectPixelsToMatch(result, expectedImage);

        result.release();
        flip.destroy();
    });

    it('retains its pooled input across the first async boundary', async () => {
        const expected = await loadFixture('canvas2d/flip/gradient-rect-horizontal.png');
        const source = await pooledCanvasFromFixture('canvas2d/flip/gradient-rect.png');
        const poison = poisonOnRecycle(source);
        const flip = new Flip();
        const output = nextOutput<PoolCanvas<OffscreenCanvas>>(flip.out.image);
        let result: PoolCanvas<OffscreenCanvas>;

        try {
            flip.in.horizontal.value = true;
            flip.in.image.value = source;
            await releaseOnNextMicrotask(source);
            result = await output;

            poison.assert();
            expectPixelsToMatch(result, expected);
        } finally {
            if (result) {
                result.release();
            }
            flip.destroy();
            poison.cleanup();
        }
    });
});
