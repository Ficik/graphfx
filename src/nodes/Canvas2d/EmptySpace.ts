import Canvas2d from './Canvas2d';
import {createCanvas, mediaSize, paintToCanvas} from '../canvas';
import {
  NumberVar
} from '../io/AbstractIOSet';

const inputs = {};
const outputs = {
  w: {
    type: 'Number',
  } as NumberVar,
  h: {
      type: 'Number',
  } as NumberVar,
  top: {
    type: 'Number',
  } as NumberVar,
  right: {
    type: 'Number',
  } as NumberVar,
  bottom: {
    type: 'Number',
  } as NumberVar,
  left: {
    type: 'Number',
  } as NumberVar
};

export default class EmptySpace extends Canvas2d<typeof inputs, typeof outputs> {

    constructor() {
      super('EmptySpace', inputs, outputs);
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
      let x = 0, y = 0, a, offset;
      let length = imageData.data.length/4;
      for (offset=0; offset<length; offset+=1) {
       x = (offset) % width;
       y = Math.floor(offset / width)
       a = imageData.data[offset * 4 + 3];
        if (a < 254) {
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
          left = Math.min(left, x);
        }

        if (x === left && y == bottom && x < right) {
          offset += (right - left) -1;
        }
      }
      this.out.top.value = top;
      this.out.right.value = right;
      this.out.bottom.value = bottom;
      this.out.left.value = left;
      this.out.w.value = right - left + 1;
      this.out.h.value = bottom - top + 1;
      return canvas;
  }
}