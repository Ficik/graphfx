import {describe, it} from 'vitest';
import Levels from './Levels';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('Levels', () => {
    it('remaps input and output levels', async () => {
        const node = new Levels();
        const result = await expectWebGLToMatch(node, 'webgl/levels.png', {
            shadow: 40,
            highlight: 220,
            gamma: 1.2,
            dark: 10,
            light: 245,
        });
        releaseWebGLResult(node, result);
    });
});
