import {describe, it} from 'vitest';
import Vignette from './Vignette';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('Vignette', () => {
    it('darkens pixels toward the image boundary', async () => {
        const node = new Vignette();
        const result = await expectWebGLToMatch(node, 'webgl/vignette.png', {
            amount: 0.8,
            size: 0.6,
        });
        releaseWebGLResult(node, result);
    });
});
