import {describe, it} from 'vitest';
import KernelPreset from './KernelPreset';
import {expectWebGLToMatch, releaseWebGLResult} from '../../../tests/helpers/webgl';

describe('KernelPreset', () => {
    it('applies the selected convolution kernel', async () => {
        const node = new KernelPreset();
        const result = await expectWebGLToMatch(node, 'webgl/kernel-preset.png', {
            preset: 'sharpen',
            passes: 1,
            multiplier: 1,
        });
        releaseWebGLResult(node, result);
    });
});
