import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';
import {resolve} from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            'graphfx/src': resolve(process.cwd(), 'src'),
        },
    },
    test: {
        browser: {
            enabled: true,
            headless: true,
            screenshotFailures: false,
            provider: playwright({
                launchOptions: {
                    args: [
                        '--use-gl=angle',
                        '--use-angle=swiftshader-webgl',
                        '--enable-unsafe-swiftshader',
                    ],
                },
            }),
            instances: [
                {browser: 'chromium'},
            ],
        },
    },
});
