import {describe, it} from 'vitest';
import LevelsAuto from './LevelsAuto';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('LevelsAuto', () => {
    it('derives levels from the source histogram', async () => {
        const node = new LevelsAuto();
        const result = await expectWebGLToMatch(node, 'webgl/levels-auto.png');
        releaseWebGLResult(node, result);
    });
});
