import {describe, it} from 'vitest';
import HSV from './HSV';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('HSV', () => {
    it('shifts hue, saturation, and value', async () => {
        const node = new HSV();
        const result = await expectWebGLToMatch(node, 'webgl/hsv.png', {
            hue: 75,
            saturation: 0.7,
            value: 0.9,
        });
        releaseWebGLResult(node, result);
    });
});
