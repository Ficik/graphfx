import {canvasPool2D, PoolCanvas} from '../../src/canvas/CanvasPool';
import {loadFixture} from './image';

export const pooledCanvasFromFixture = async (path: string) => {
    const image = await loadFixture(path);
    const canvas = canvasPool2D.createCanvas();
    canvas.acquire();
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    return canvas;
};

export const releaseOnNextMicrotask = (
    ...canvases: PoolCanvas<OffscreenCanvas>[]
) => new Promise<void>((resolve) => {
    queueMicrotask(() => {
        for (const canvas of canvases) {
            canvas.release();
        }
        resolve();
    });
});

export const poisonOnRecycle = (
    ...targets: PoolCanvas<OffscreenCanvas>[]
) => {
    const pending = new Set<PoolCanvas<OffscreenCanvas>>(targets);
    const recycled: PoolCanvas<OffscreenCanvas>[] = [];
    let error: Error = null;

    const unsubscribe = canvasPool2D.onAvailable((canvas) => {
        if (!pending.has(canvas)) {
            return;
        }
        pending.delete(canvas);

        const reused = canvasPool2D.createCanvas();
        if (reused !== canvas) {
            error = new Error('CanvasPool did not recycle the most recently released canvas');
            return;
        }

        reused.acquire();
        reused.width = 1;
        reused.height = 1;
        const context = reused.getContext('2d');
        context.fillStyle = '#ff0000';
        context.fillRect(0, 0, 1, 1);
        recycled.push(reused);
    });

    return {
        assert() {
            if (error) {
                throw error;
            }
        },
        cleanup() {
            unsubscribe();
            for (const canvas of recycled) {
                canvas.release();
            }
        },
    };
};
