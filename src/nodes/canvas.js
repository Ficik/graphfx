/**
 *
 * @param {Number} width
 * @param {Number} height
 * @returns {HTMLCanvasElement}
 */
export const createCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    return canvas;
}

/**
 * @typedef {HTMLImageElement|HTMLVideoElement} PaintableElement
 * @typedef {{top: Number, left: Number, width: Number, height: Number}} Bounds
 * @typedef {function(HTMLCanvasElement, PaintableElement, Bounds): HTMLCanvasElement} PaintToCanvasFunction
 */


/**
 *
 * @param {PaintableElement|{width: Number, height: Number}} media
 * @returns {{width: Number, height: Number}}
 */
export const mediaSize = (media) =>
  (media instanceof HTMLVideoElement) ? {width: media.videoWidth, height: media.videoHeight} :
  (media instanceof HTMLImageElement) ? {width: media.naturalWidth, height: media.naturalHeight} :
  {width: media.width, height: media.height};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {PaintableElement} media
 * @param {Bounds} param2
 */
export const paintToCanvas = (canvas, media, {top, left, width, height}) => {
  const ctx = canvas.getContext('2d');
  if (canvas.width > 0 && canvas.height > 0 && width > 0 && height > 0) {
      ctx.drawImage(media, left, top, width, height);
  }
  return canvas;
};