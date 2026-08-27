import {describe, expect, it} from 'vitest';
import Compose from './Compose';
import {PoolCanvas} from '../../canvas/CanvasPool';
import {expectPixelsToMatch, loadFixture} from '../../../tests/helpers/image';
import {nextOutput} from '../../../tests/helpers/node';
import {
    poisonOnRecycle,
    pooledCanvasFromFixture,
    releaseOnNextMicrotask,
} from '../../../tests/helpers/canvasPool';

const render = async (mode: string) => {
    const background = await loadFixture('canvas2d/flip/gradient-rect.png');
    const foreground = await loadFixture('canvas2d/compose/overlay.png');
    const compose = new Compose();
    const output = nextOutput<PoolCanvas<OffscreenCanvas>>(
        compose.out.image,
        (value) => Boolean(value && value.width === 96 && value.height === 64),
    );

    compose.in.width.value = 96;
    compose.in.height.value = 64;
    compose.in.mode.value = mode;
    compose.in.fgX.value = 17;
    compose.in.fgY.value = 21;
    compose.in.bg.value = background;
    compose.in.fg.value = foreground;

    const result = await output;
    expect(compose.out.width.value).toBe(96);
    expect(compose.out.height.value).toBe(64);
    return {compose, result};
};

describe('Compose', () => {
    it.each([
        {mode: 'source-over', expected: 'source-over.png', tolerance: 0},
        {mode: 'multiply', expected: 'multiply.png', tolerance: 1},
    ])('composes positioned images using $mode', async ({mode, expected, tolerance}) => {
        const expectedImage = await loadFixture(`canvas2d/compose/${expected}`);
        const {compose, result} = await render(mode);

        expectPixelsToMatch(result, expectedImage, tolerance);

        result.release();
        compose.destroy();
    });

    it('retains both pooled inputs across the first async boundary', async () => {
        const expected = await loadFixture('canvas2d/compose/source-over.png');
        const background = await pooledCanvasFromFixture('canvas2d/flip/gradient-rect.png');
        const foreground = await pooledCanvasFromFixture('canvas2d/compose/overlay.png');
        const poison = poisonOnRecycle(background, foreground);
        const compose = new Compose();
        const output = nextOutput<PoolCanvas<OffscreenCanvas>>(compose.out.image);
        let result: PoolCanvas<OffscreenCanvas>;

        try {
            compose.in.width.value = 96;
            compose.in.height.value = 64;
            compose.in.fgX.value = 17;
            compose.in.fgY.value = 21;
            compose.in.bg.value = background;
            compose.in.fg.value = foreground;
            await releaseOnNextMicrotask(background, foreground);
            result = await output;

            poison.assert();
            expectPixelsToMatch(result, expected);
        } finally {
            if (result) {
                result.release();
            }
            compose.destroy();
            poison.cleanup();
        }
    });
});
