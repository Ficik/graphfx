
class CanvasPool {

    constructor(ctx) {
        this.__ctx = ctx;
        this.__pool = [];
        this.__pointerCounter = new WeakMap();
    }

    __createNewCanvas() {
        console.log('create new canvas');
        const canvas = (this.__ctx !== 'webgl') ? new OffscreenCanvas(1,1) : document.createElement('canvas');
        canvas.acquire = this.acquireCanvas.bind(this, canvas);
        canvas.release = this.releaseCanvas.bind(this, canvas);
        canvas.getContext(this.__ctx);
        this.__pool.push(canvas);
        this.__pointerCounter.set(canvas, 0);
    }

    createCanvas() {
        if (this.__pool.length === 0) {
            this.__createNewCanvas();
        }
        return this.__pool.pop();
    }

    acquireCanvas(canvas) {
        const inUse = this.__pointerCounter.get(canvas) + 1;
        this.__pointerCounter.set(canvas, inUse);
    }

    releaseCanvas(canvas) {
        const inUse = this.__pointerCounter.get(canvas) - 1;
        this.__pointerCounter.set(canvas, inUse);
        if (inUse === 0) {
            this.__pool.push(canvas);
        }
    }

}

export const canvasPool2D = new CanvasPool('2d');
export const canvasPoolWebGL = new CanvasPool('webgl');
