import {
  ImageVar,
  StringVar,
} from './io/AbstractIOSet';
import Node from './Node';
import {canvasPool2D} from '../canvas/CanvasPool';
import {waitForMedia} from '../utils';
import {mediaSize} from './canvas';

const inputs = {
  image: {
    type: 'Image',
  } as ImageVar,
  type: {
    type: 'String',
    enum: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    default: 'image/png',
  } as StringVar,
};

const outputs = {
  base64: {
    type: 'String',
  } as StringVar,
};

export default class ImgToBase64 extends Node<typeof inputs, typeof outputs> {
  constructor(options = {}) {
    super('ImgToBase64', inputs, outputs);
  }

  async _update() {
    const media = this.in.image.value;

    if (!media) {
      return;
    }
    await waitForMedia(media);
    const {width, height} = mediaSize(media);

    const canvas = canvasPool2D.createCanvas();
    canvas.acquire();
    canvas.width = width;
    canvas.height = height;

    // @ts-ignore
    canvas.getContext('2d').drawImage(media, 0, 0, width, height);

    const blob = await canvas.convertToBlob({type: this.in.type.value});

    this.out.base64.value = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsDataURL(blob);
    });
  }
}
