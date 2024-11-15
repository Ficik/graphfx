import {
  ImageVar,
  NumberVar,
  StringVar,
} from './io/AbstractIOSet';
import Node from './Node';
import {canvasPool2D} from '../canvas/CanvasPool';

const inputs = {
  base64: {
    type: 'String',
  } as StringVar,
};

const outputs = {
  image: {
    type: 'Image',
  } as ImageVar,
  width: {
    type: 'Number',
  } as NumberVar,
  height: {
    type: 'Number',
  } as NumberVar,
};

/**
 * TODO: after successful tests move this to the library
 */
export default class Base64ToImg extends Node<typeof inputs, typeof outputs> {
  constructor(options = {}) {
    super('Base64ToImg', inputs, outputs);
  }

  async _update() {
    let base64String = this.in.base64.value;

    if (!base64String) {
      return;
    }

    if (!base64String.startsWith('data:image/')) {
      base64String = `data:${this.estimateImageMimeType(base64String)};base64,${base64String}`;
    }

    const canvas = canvasPool2D.createCanvas();
    canvas.acquire();

    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const canvasContext = canvas.getContext('2d');
        canvasContext.drawImage(img, 0, 0);
        resolve(img);
      };

      img.onerror = (e) => {
        reject(new Error(e as string));
      };

      img.src = base64String;
    });

    this.out.image.value = canvas;
    this.out.width.value = canvas.width;
    this.out.height.value = canvas.height;
  }

  private estimateImageMimeType(base64String: string): string {
    // Attempt to estimate the MIME type based on base64 signature.
    if (base64String.startsWith('iVBORw0KGgo=')) {
      return 'image/png';
    } else if (base64String.startsWith('/9j/')) {
      return 'image/jpeg';
    } else if (base64String.startsWith('UklGR')) {
      return 'image/webp';
    } else {
      // Default or unknown type
      return 'application/octet-stream';
    }
  }
}
