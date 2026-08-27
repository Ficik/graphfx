import {describe, it} from 'vitest';
import Blur from './Blur';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('Blur', () => {
    it('applies a two-pass Gaussian blur', async () => {
        const node = new Blur();
        const result = await expectWebGLToMatch(node, 'webgl/blur.png', {
            radius: 3,
            sigma: 1.2,
            passes: 1,
        });
        releaseWebGLResult(node, result);
    });
});
