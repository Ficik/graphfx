import {describe, it} from 'vitest';
import GreenScreen from './Greenscreen';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('GreenScreen', () => {
    it('keys pixels matching the selected screen color', async () => {
        const node = new GreenScreen();
        const result = await expectWebGLToMatch(node, 'webgl/greenscreen.png', {
            screen: '#7BE141',
            balance: 0.5,
            screenWeight: 1,
            clipBlack: 0.1,
            clipWhite: 0.8,
        });
        releaseWebGLResult(node, result);
    });
});
