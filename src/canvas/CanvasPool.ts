export type PoolCanvas<T extends (OffscreenCanvas | HTMLCanvasElement)> = T & {
    acquire(): () => void
    release(): void
}

class CanvasPool<T extends (OffscreenCanvas | HTMLCanvasElement)> {

    __ctx: any
    __pool: PoolCanvas<T>[]
    __pointerCounter: WeakMap<PoolCanvas<T>, number>
    __availableListeners: Set<(canvas: PoolCanvas<T>) => void>

    constructor(ctx) {
        this.__ctx = ctx;
        this.__pool = [];
        this.__pointerCounter = new WeakMap();
        this.__availableListeners = new Set();
    }

    __createNewCanvas() {
        const canvas = (this.__ctx !== 'webgl') ? new OffscreenCanvas(1,1) : document.createElement('canvas');
        // @ts-ignore
        canvas.acquire = this.acquireCanvas.bind(this, canvas);
        // @ts-ignore
        canvas.release = this.releaseCanvas.bind(this, canvas);
        canvas.getContext(this.__ctx);
        this.__pool.push(<PoolCanvas<T>>canvas);
        this.__pointerCounter.set(<PoolCanvas<T>>canvas, 0);
    }

    createCanvas():PoolCanvas<T> {
        if (this.__pool.length === 0) {
            this.__createNewCanvas();
        }
        return this.__pool.pop();
    }

    acquireCanvas(canvas: PoolCanvas<T>) {
        const inUse = this.__pointerCounter.get(canvas) + 1;
        this.__pointerCounter.set(canvas, inUse);
        let released = false;
        return () => {
            if (!released) {
                released = true;
                this.releaseCanvas(canvas);
            }
        }
    }

    onAvailable(listener: (canvas: PoolCanvas<T>) => void) {
        this.__availableListeners.add(listener);
        return () => this.__availableListeners.delete(listener);
    }

    releaseCanvas(canvas: PoolCanvas<T>) {
        const inUse = this.__pointerCounter.get(canvas) - 1;
        this.__pointerCounter.set(canvas, inUse);
        if (inUse === 0) {
            this.__pool.push(canvas);
            for (const listener of this.__availableListeners) {
                listener(canvas);
            }
        }
    }

}

export const canvasPool2D = new CanvasPool<OffscreenCanvas>('2d');
export const canvasPoolWebGL = new CanvasPool<HTMLCanvasElement>('webgl');
