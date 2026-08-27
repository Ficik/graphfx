import {describe, it} from 'vitest';
import Edge from './Edge';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('Edge', () => {
    it('extracts diagonal pixel differences', async () => {
        const node = new Edge();
        const result = await expectWebGLToMatch(node, 'webgl/edge.png', {
            dx: 1,
            dy: 1,
        });
        releaseWebGLResult(node, result);
    });
});
