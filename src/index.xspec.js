import * as nodes from './nodes';
import {createCanvas} from './nodes/canvas';

const createImage = (width, height) => {
    const ctx = createCanvas(width, height).getContext('2d')
    ctx.fillStyle = 'silver';
    ctx.fillRect(0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
}

const Image = createImage(1920, 1080);

describe('basic usage', () => {
    it('should emit image', (cb) => {

        const resize = new nodes.Resize({width: 100, height: 100, method: 'cover'});
        const output = new nodes.ToBlob({type: 'image/jpeg', quality: 100});

        output.in.image.connect(resize.out.image);

        resize.out.image.onchange((value) => {
            expect(value.width).toBe(100);
            expect(value.height).toBe(100);
        });

        output.out.image.onchange((/** @type {Blob} */blob) => {
            expect(blob.size).toBeGreaterThan(0);
            cb();
        })

        resize.in.image.value = Image;
    });
})