import {describe, expect, it} from 'vitest';
import EmptySpace from './EmptySpace';
import {PoolCanvas} from '../../canvas/CanvasPool';
import {expectPixelsToMatch, loadFixture} from '../../../tests/helpers/image';
import {nextOutput} from '../../../tests/helpers/node';
import {
    poisonOnRecycle,
    pooledCanvasFromFixture,
    releaseOnNextMicrotask,
} from '../../../tests/helpers/canvasPool';

describe('EmptySpace', () => {
    it('reports the bounds of transparent pixels', async () => {
        const source = await loadFixture('canvas2d/empty-space/transparent-hole.png');
        const emptySpace = new EmptySpace();
        const output = nextOutput<PoolCanvas<OffscreenCanvas>>(
            emptySpace.out.image,
            (value) => Boolean(value && value.width === 40 && value.height === 30),
        );

        emptySpace.in.image.value = source;
        const result = await output;

        expect({
            left: emptySpace.out.left.value,
            right: emptySpace.out.right.value,
            top: emptySpace.out.top.value,
            bottom: emptySpace.out.bottom.value,
            width: emptySpace.out.w.value,
            height: emptySpace.out.h.value,
        }).toEqual({
            left: 7,
            right: 19,
            top: 5,
            bottom: 13,
            width: 13,
            height: 9,
        });
        expectPixelsToMatch(result, source);

        result.release();
        emptySpace.destroy();
    });

    it('retains its pooled input across the first async boundary', async () => {
        const expected = await loadFixture('canvas2d/empty-space/transparent-hole.png');
        const source = await pooledCanvasFromFixture('canvas2d/empty-space/transparent-hole.png');
        const poison = poisonOnRecycle(source);
        const emptySpace = new EmptySpace();
        const output = nextOutput<PoolCanvas<OffscreenCanvas>>(emptySpace.out.image);
        let result: PoolCanvas<OffscreenCanvas>;

        try {
            emptySpace.in.image.value = source;
            await releaseOnNextMicrotask(source);
            result = await output;

            poison.assert();
            expectPixelsToMatch(result, expected);
        } finally {
            if (result) {
                result.release();
            }
            emptySpace.destroy();
            poison.cleanup();
        }
    });
});
