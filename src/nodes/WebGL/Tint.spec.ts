import {describe, it} from 'vitest';
import Tint from './Tint';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('Tint', () => {
    it('applies the requested tint amount', async () => {
        const node = new Tint();
        const result = await expectWebGLToMatch(node, 'webgl/tint.png', {
            amount: 0.4,
        });
        releaseWebGLResult(node, result);
    });
});
