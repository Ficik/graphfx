export const createCanvas = (width: number, height: number):HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    return canvas;
}

type Canvas = HTMLCanvasElement | OffscreenCanvas;

export type Bounds = {top: number, left: number, width: number, height: number};

export const mediaSize = (media: HTMLImageElement|HTMLVideoElement|{width: number, height: number}) =>
  (media === null) ? {width: null, height: null} :
  (media instanceof HTMLVideoElement) ? {width: media.videoWidth, height: media.videoHeight} :
  (media instanceof HTMLImageElement) ? {width: media.naturalWidth, height: media.naturalHeight} :
  {width: media.width, height: media.height};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {PaintableElement} media
 * @param {Bounds} param2
 */
export const paintToCanvas = (
  canvas: Canvas,
  media: CanvasImageSource,
  {top, left, width, height}: Bounds
) => {
  const ctx = canvas.getContext('2d');
  if (canvas.width > 0 && canvas.height > 0 && width > 0 && height > 0) {
      ctx.drawImage(media, left, top, width, height);
  }
  return canvas;
};