/*
Copyright (c) 2011 Juan Mellado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
References:
- "OpenCV: Open Computer Vision Library"
  http://sourceforge.net/projects/opencvlibrary/
- "Stack Blur: Fast But Goodlooking"
  http://incubator.quasimondo.com/processing/fast_blur_deluxe.php
*/

interface CVSlice {
  start_index: number
  end_index: number
};

export interface CVPoint {
  x: number
  y: number
};

export interface CVContour {
  points: CVPoint[]
  hole: boolean
  tooNear: boolean
}

export const grayscale = (imageSrc: ImageData): ImageData => {
  const imageDst = new ImageData(imageSrc.width, imageSrc.height);

  const src = imageSrc.data;
  const dst = imageDst.data;
  const len = src.length;
  let j = 0;

  for (let i = 0; i < len; i += 4) {
    dst[j++] =
      (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114 + 0.5) & 0xff;
  }

  return imageDst;
};

export const threshold = (imageSrc: ImageData, threshold: number): ImageData => {
  const src = imageSrc.data;
  const imageDst = new ImageData(imageSrc.width, imageSrc.height);

  const dst = imageDst.data;
  const len = src.length;
  const tab: number[] = [];

  for (let i = 0; i < 256; ++i) {
    tab[i] = i <= threshold ? 0 : 255;
  }

  for (let i = 0; i < len; ++i) {
    dst[i] = tab[src[i]];
  }

  return imageDst;
};

export const adaptiveThreshold = (imageSrc: ImageData, kernelSize: number, threshold: number): ImageData => {
  const src = imageSrc.data;
  const imageDst = new ImageData(imageSrc.width, imageSrc.height);

  const dst = imageDst.data;
  const len = src.length;
  const tab: number[] = [];

  stackBoxBlur(imageSrc, imageDst, kernelSize);

  for (let i = 0; i < 768; ++i) {
    tab[i] = (i - 255 <= -threshold) ? 255 : 0;
  }

  for (let i = 0; i < len; ++i) {
    dst[i] = tab[src[i] - dst[i] + 255];
  }

  return imageDst;
};

export const otsu = (imageSrc: ImageData): number => {
  const src = imageSrc.data;
  const len = src.length;
  const hist: number[] = [];
  let threshold = 0;
  let sum = 0;
  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let max = 0;

  for (let i = 0; i < 256; ++i) {
    hist[i] = 0;
  }

  for (let i = 0; i < len; ++i) {
    hist[src[i]]++;
  }

  for (let i = 0; i < 256; ++i) {
    sum += hist[i] * i;
  }

  for (let i = 0; i < 256; ++i) {
    wB += hist[i];
    if (wB !== 0) {
      wF = len - wB;
      if (wF === 0) {
        break;
      }

      sumB += hist[i] * i;

      const mu = (sumB / wB) - ((sum - sumB) / wF);
      const between = wB * wF * mu * mu;

      if (between > max) {
        max = between;
        threshold = i;
      }
    }
  }

  return threshold;
};

const stackBoxBlurMult =
  [1, 171, 205, 293, 57, 373, 79, 137, 241, 27, 391, 357, 41, 19, 283, 265];

const stackBoxBlurShift =
  [0, 9, 10, 11, 9, 12, 10, 11, 12, 9, 13, 13, 10, 9, 13, 13];

class BlurStack {
  color: number = 0;
  next: BlurStack | null = null;
};

export const stackBoxBlur = (imageSrc: ImageData, imageDst: ImageData, kernelSize: number): ImageData => {
  const src = imageSrc.data;
  const dst = imageDst.data;
  const height = imageSrc.height;
  const width = imageSrc.width;
  const heightMinus1 = height - 1;
  const widthMinus1 = width - 1;
  const size = kernelSize + kernelSize + 1;
  const radius = kernelSize + 1;
  const mult = stackBoxBlurMult[kernelSize];
  const shift = stackBoxBlurShift[kernelSize];
  let stack: BlurStack | null;
  let stackStart: BlurStack | null;
  let color: number;
  let sum: number;
  let pos: number;
  let start: number;
  let p: number;

  stack = stackStart = new BlurStack();
  for (let i = 1; i < size; ++i) {
    stack = stack.next = new BlurStack();
  }
  stack.next = stackStart;

  pos = 0;

  for (let y = 0; y < height; ++y) {
    start = pos;

    color = src[pos];
    sum = radius * color;

    stack = stackStart;
    for (let i = 0; i < radius; ++i) {
      stack!.color = color;
      stack = stack!.next;
    }
    for (let i = 1; i < radius; ++i) {
      stack!.color = src[pos + i];
      sum += stack!.color;
      stack = stack!.next;
    }

    stack = stackStart;
    for (let x = 0; x < width; ++x) {
      dst[pos++] = (sum * mult) >>> shift;

      p = x + radius;
      p = start + (p < widthMinus1 ? p : widthMinus1);
      sum -= stack!.color - src[p];

      stack!.color = src[p];
      stack = stack!.next;
    }
  }

  for (let x = 0; x < width; ++x) {
    pos = x;
    start = pos + width;

    color = dst[pos];
    sum = radius * color;

    stack = stackStart;
    for (let i = 0; i < radius; ++i) {
      stack!.color = color;
      stack = stack!.next;
    }
    for (let i = 1; i < radius; ++i) {
      stack!.color = dst[start];
      sum += stack!.color;
      stack = stack!.next;

      start += width;
    }

    stack = stackStart;
    for (let y = 0; y < height; ++y) {
      dst[pos] = (sum * mult) >>> shift;

      p = y + radius;
      p = x + ((p < heightMinus1 ? p : heightMinus1) * width);
      sum -= stack!.color - dst[p];

      stack!.color = dst[p];
      stack = stack!.next;

      pos += width;
    }
  }

  return imageDst;
};

export const findContours = (imageSrc: ImageData, binary: number[]): CVContour[] => {
  const width = imageSrc.width;
  const height = imageSrc.height;
  const contours: CVContour[] = [];
  let pix: number;

  const src = binaryBorder(imageSrc, binary);

  const deltas = neighborhoodDeltas(width + 2);

  let pos = width + 3;
  let nbd = 1;

  for (let i = 0; i < height; ++i, pos += 2) {
    for (let j = 0; j < width; ++j, ++pos) {
      pix = src[pos];

      if (pix !== 0) {
        let outer: boolean;
        let hole: boolean;

        outer = hole = false;

        if (pix === 1 && src[pos - 1] === 0) {
          outer = true;
        } else if (pix >= 1 && src[pos + 1] === 0) {
          hole = true;
        }

        if (outer || hole) {
          ++nbd;

          contours.push(borderFollowing(src, pos, nbd, { x: j, y: i }, hole, deltas));
        }
      }
    }
  }

  return contours;
};

const borderFollowing = (src: number[], pos: number, nbd: number, point: CVPoint, hole: boolean, deltas: number[]): CVContour => {
  const contour: CVContour = {
    hole: false,
    points: [],
    tooNear: false
  };
  let pos1: number;
  let pos3: number;
  let pos4: number;
  let s: number;
  let s_end: number;

  contour.hole = hole;

  s = s_end = hole ? 0 : 4;
  do {
    s = (s - 1) & 7;
    pos1 = pos + deltas[s];
    if (src[pos1] !== 0) {
      break;
    }
  } while (s !== s_end);

  if (s === s_end) {
    src[pos] = -nbd;
    contour.points.push({ x: point.x, y: point.y });
  } else {
    pos3 = pos;

    while (true) {
      s_end = s;

      do {
        pos4 = pos3 + deltas[++s];
      } while (src[pos4] === 0);

      s &= 7;

      if (((s - 1) >>> 0) < (s_end >>> 0)) {
        src[pos3] = -nbd;
      } else if (src[pos3] === 1) {
        src[pos3] = nbd;
      }

      contour.points.push({ x: point.x, y: point.y });

      point.x += neighborhood[s][0];
      point.y += neighborhood[s][1];

      if ((pos4 === pos) && (pos3 === pos1)) {
        break;
      }

      pos3 = pos4;
      s = (s + 4) & 7;
    }
  }

  return contour;
};

const neighborhood =
  [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]];

const neighborhoodDeltas = (width: number): number[] => {
  const deltas: number[] = [];
  const len = neighborhood.length;

  for (let i = 0; i < len; ++i) {
    deltas[i] = neighborhood[i][0] + (neighborhood[i][1] * width);
  }

  return deltas.concat(deltas);
};

export const approxPolyDP = (contour: CVPoint[], epsilon: number): CVPoint[] => {
  let slice: CVSlice = { start_index: 0, end_index: 0 };
  const right_slice: CVSlice = { start_index: 0, end_index: 0 };
  const poly: CVPoint[] = [];
  const stack: CVSlice[] = [];
  const len = contour.length;
  let start_pt: CVPoint;
  let end_pt: CVPoint;
  let dist: number; let max_dist: number; let le_eps: boolean;

  let dx: number;
  let dy: number; let k: number;

  epsilon *= epsilon;

  k = 0;

  for (let i = 0; i < 3; ++i) {
    max_dist = 0;

    k = (k + right_slice.start_index) % len;
    start_pt = contour[k];
    if (++k === len) { k = 0; }

    for (let j = 1; j < len; ++j) {
      const pt = contour[k];
      if (++k === len) { k = 0; }

      dx = pt.x - start_pt.x;
      dy = pt.y - start_pt.y;
      dist = dx * dx + dy * dy;

      if (dist > max_dist) {
        max_dist = dist;
        right_slice.start_index = j;
      }
    }
  }

  if (max_dist! <= epsilon) {
    poly.push({ x: start_pt!.x, y: start_pt!.y });
  } else {
    slice.start_index = k;
    slice.end_index = (right_slice.start_index += slice.start_index);

    right_slice.start_index -= right_slice.start_index >= len ? len : 0;
    right_slice.end_index = slice.start_index;
    if (right_slice.end_index < right_slice.start_index) {
      right_slice.end_index += len;
    }

    stack.push({ start_index: right_slice.start_index, end_index: right_slice.end_index });
    stack.push({ start_index: slice.start_index, end_index: slice.end_index });
  }

  while (stack.length !== 0) {
    slice = stack.pop()!;

    end_pt = contour[slice.end_index % len];
    start_pt = contour[k = slice.start_index % len];
    if (++k === len) { k = 0; }

    if (slice.end_index <= slice.start_index + 1) {
      le_eps = true;
    } else {
      max_dist = 0;

      dx = end_pt.x - start_pt.x;
      dy = end_pt.y - start_pt.y;

      for (let i = slice.start_index + 1; i < slice.end_index; ++i) {
        const pt = contour[k];
        if (++k === len) { k = 0; }

        dist = Math.abs((pt.y - start_pt.y) * dx - (pt.x - start_pt.x) * dy);

        if (dist > max_dist) {
          max_dist = dist;
          right_slice.start_index = i;
        }
      }

      le_eps = max_dist * max_dist <= epsilon * (dx * dx + dy * dy);
    }

    if (le_eps) {
      poly.push({ x: start_pt.x, y: start_pt.y });
    } else {
      right_slice.end_index = slice.end_index;
      slice.end_index = right_slice.start_index;

      stack.push({ start_index: right_slice.start_index, end_index: right_slice.end_index });
      stack.push({ start_index: slice.start_index, end_index: slice.end_index });
    }
  }

  return poly;
};

export const warp = (imageSrc: ImageData, contour: CVContour, warpSize: number): ImageData => {
  const imageDst = new ImageData(warpSize, warpSize);
  const src = imageSrc.data; const dst = imageDst.data;
  const width = imageSrc.width; const height = imageSrc.height;

  let pos = 0;
  let p1: number; let p2: number; let p3: number; let p4: number;
  let r: number; let s: number; let t: number; let u: number; let v: number; let w: number;

  const m = getPerspectiveTransform(contour, warpSize - 1);

  r = m[8];
  s = m[2];
  t = m[5];

  for (let i = 0; i < warpSize; ++i) {
    r += m[7];
    s += m[1];
    t += m[4];

    u = r;
    v = s;
    w = t;

    for (let j = 0; j < warpSize; ++j) {
      u += m[6];
      v += m[0];
      w += m[3];

      const x = v / u;
      const y = w / u;

      const sx1 = x >>> 0;
      const sx2 = (sx1 === width - 1) ? sx1 : sx1 + 1;
      const dx1 = x - sx1;
      const dx2 = 1.0 - dx1;

      const sy1 = y >>> 0;
      const sy2 = (sy1 === height - 1) ? sy1 : sy1 + 1;
      const dy1 = y - sy1;
      const dy2 = 1.0 - dy1;

      p1 = p2 = sy1 * width;
      p3 = p4 = sy2 * width;

      dst[pos++] =
        (dy2 * (dx2 * src[p1 + sx1] + dx1 * src[p2 + sx2]) +
          dy1 * (dx2 * src[p3 + sx1] + dx1 * src[p4 + sx2])) & 0xff;
    }
  }

  return imageDst;
};

const getPerspectiveTransform = (src: CVContour, size: number): number[] => {
  const rq = square2quad(src);

  rq[0] /= size;
  rq[1] /= size;
  rq[3] /= size;
  rq[4] /= size;
  rq[6] /= size;
  rq[7] /= size;

  return rq;
};

const square2quad = (srcC: CVContour): number[] => {
  const sq: number[] = [];
  const src = srcC.points;

  const px = src[0].x - src[1].x + src[2].x - src[3].x;
  const py = src[0].y - src[1].y + src[2].y - src[3].y;

  if (px === 0 && py === 0) {
    sq[0] = src[1].x - src[0].x;
    sq[1] = src[2].x - src[1].x;
    sq[2] = src[0].x;
    sq[3] = src[1].y - src[0].y;
    sq[4] = src[2].y - src[1].y;
    sq[5] = src[0].y;
    sq[6] = 0;
    sq[7] = 0;
    sq[8] = 1;
  } else {
    const dx1 = src[1].x - src[2].x;
    const dx2 = src[3].x - src[2].x;
    const dy1 = src[1].y - src[2].y;
    const dy2 = src[3].y - src[2].y;
    const den = dx1 * dy2 - dx2 * dy1;

    sq[6] = (px * dy2 - dx2 * py) / den;
    sq[7] = (dx1 * py - px * dy1) / den;
    sq[8] = 1;
    sq[0] = src[1].x - src[0].x + sq[6] * src[1].x;
    sq[1] = src[3].x - src[0].x + sq[7] * src[3].x;
    sq[2] = src[0].x;
    sq[3] = src[1].y - src[0].y + sq[6] * src[1].y;
    sq[4] = src[3].y - src[0].y + sq[7] * src[3].y;
    sq[5] = src[0].y;
  }

  return sq;
};

export const isContourConvex = (contour: CVPoint[]): boolean => {
  let orientation = 0; let convex = true;
  const len = contour.length;
  let j = 0;
  let cur_pt: CVPoint;
  let prev_pt: CVPoint;
  let dx0: number;
  let dy0: number;

  prev_pt = contour[len - 1];
  cur_pt = contour[0];

  dx0 = cur_pt.x - prev_pt.x;
  dy0 = cur_pt.y - prev_pt.y;

  for (let i = 0; i < len; ++i) {
    if (++j === len) { j = 0; }

    prev_pt = cur_pt;
    cur_pt = contour[j];

    const dx = cur_pt.x - prev_pt.x;
    const dy = cur_pt.y - prev_pt.y;
    const dxdy0 = dx * dy0;
    const dydx0 = dy * dx0;

    orientation |= dydx0 > dxdy0 ? 1 : (dydx0 < dxdy0 ? 2 : 3);

    if (orientation === 3) {
      convex = false;
      break;
    }

    dx0 = dx;
    dy0 = dy;
  }

  return convex;
};

export const perimeter = (poly: CVContour): number => {
  const len = poly.points.length;
  let j = len - 1;
  let p = 0.0;

  for (let i = 0; i < len; j = i++) {
    const dx = poly.points[i].x - poly.points[j].x;
    const dy = poly.points[i].y - poly.points[j].y;

    p += Math.sqrt(dx * dx + dy * dy);
  }

  return p;
};

export const minEdgeLength = (poly: CVPoint[]): number => {
  const len = poly.length;
  let j = len - 1;
  let min = Infinity;

  for (let i = 0; i < len; j = i++) {
    const dx = poly[i].x - poly[j].x;
    const dy = poly[i].y - poly[j].y;

    const d = dx * dx + dy * dy;

    if (d < min) {
      min = d;
    }
  }

  return Math.sqrt(min);
};

export const countNonZero = (imageSrc: ImageData, square: { height: any, width: any, x: number, y: number }): number => {
  const src = imageSrc.data;
  const height = square.height;
  const width = square.width;
  const span = imageSrc.width - width;
  let pos = square.x + (square.y * imageSrc.width);
  let nz = 0;

  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
      if (src[pos++] !== 0) {
        ++nz;
      }
    }

    pos += span;
  }

  return nz;
};

const binaryBorder = (imageSrc: ImageData, dst: number[]): number[] => {
  const src = imageSrc.data;
  const height = imageSrc.height;
  const width = imageSrc.width;

  let posSrc = 0;
  let posDst = 0;

  for (let j = -2; j < width; ++j) {
    dst[posDst++] = 0;
  }

  for (let i = 0; i < height; ++i) {
    dst[posDst++] = 0;

    for (let j = 0; j < width; ++j) {
      dst[posDst++] = (src[posSrc++] === 0 ? 0 : 1);
    }

    dst[posDst++] = 0;
  }

  for (let j = -2; j < width; ++j) {
    dst[posDst++] = 0;
  }

  return dst;
};
