import Canvas2d from './Canvas2d';
import {createCanvas, mediaSize, paintToCanvas} from '../canvas';

export default class EmptySpace extends Canvas2d {

    constructor() {
        super('EmptySpace', {
        }, {
        w: {
          type: 'Number',
        },
        h: {
            type: 'Number',
        },
        top: {
          type: 'Number',
        },
        right: {
          type: 'Number',
        },
        bottom: {
          type: 'Number',
        },
        left: {
          type: 'Number',
        }
      });
      this._update();
    }

    async render({image}, canvas, ctx) {
      if (!image) {
        return;
      }
      let left = Infinity;
      let right = -Infinity;
      let top = Infinity;
      let bottom = -Infinity;

      const {width, height} = mediaSize(image);
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height)
      for (let offset=0; offset<imageData.data.length; offset+=4) {
        const x = (offset/4) % width;
        const y = Math.floor((offset/4) / width)
        const [r,g,b,a] = imageData.data.slice(offset, offset+4);
        if (a < 1) {
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
          left = Math.min(left, x);
        }
        imageData.data[offset] = a;
        imageData.data[offset + 1] = a;
        imageData.data[offset + 2] = a;
        imageData.data[offset + 3] = a;
      }
      ctx.putImageData(imageData, 0, 0);
      this.out.top.value = top;
      this.out.right.value = right;
      this.out.bottom.value = bottom;
      this.out.left.value = left;
      this.out.w.value = right - left;
      this.out.h.value = bottom - top;
      return canvas;
  }
}