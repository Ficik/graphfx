import {describe, it} from 'vitest';
import Sepia from './Sepia';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('Sepia', () => {
    it('applies the requested sepia amount', async () => {
        const node = new Sepia();
        const result = await expectWebGLToMatch(node, 'webgl/sepia.png', {
            amount: 0.8,
        });
        releaseWebGLResult(node, result);
    });
});
