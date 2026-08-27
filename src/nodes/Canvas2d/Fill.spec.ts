import {describe, expect, it} from 'vitest';
import Fill from './Fill';
import {PoolCanvas} from '../../canvas/CanvasPool';
import {expectPixelsToMatch, loadFixture} from '../../../tests/helpers/image';
import {nextOutput} from '../../../tests/helpers/node';

describe('Fill', () => {
    it('fills the requested dimensions with a solid color', async () => {
        const expectedImage = await loadFixture('canvas2d/fill/blue.png');
        const fill = new Fill();
        const output = nextOutput<PoolCanvas<OffscreenCanvas>>(
            fill.out.image,
            (value) => Boolean(value && value.width === 48 && value.height === 32),
        );

        fill.in.width.value = 48;
        fill.in.height.value = 32;
        fill.in.color.value = '#326496';
        const result = await output;

        expect(fill.out.width.value).toBe(48);
        expect(fill.out.height.value).toBe(32);
        expectPixelsToMatch(result, expectedImage);

        result.release();
        fill.destroy();
    });
});
