import {describe, it} from 'vitest';
import SoftEdge from './SoftEdge';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('SoftEdge', () => {
    it('softens alpha edges without replacing source colors', async () => {
        const node = new SoftEdge();
        const result = await expectWebGLToMatch(
            node,
            'webgl/soft-edge.png', {
                radius: 3,
                sigma: 1.2,
                passes: 1,
            },
            'canvas2d/empty-space/transparent-hole.png',
        );
        releaseWebGLResult(node, result);
    });
});
