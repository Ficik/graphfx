import {describe, it} from 'vitest';
import Channels from './Channels';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('Channels', () => {
    it('mixes the selected channels into grayscale', async () => {
        const node = new Channels();
        const result = await expectWebGLToMatch(node, 'webgl/channels.png', {
            red: 0.8,
            green: 0.15,
            blue: 0.05,
            amount: 0.7,
        });
        releaseWebGLResult(node, result);
    });
});
