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
- "ArUco: a minimal library for Augmented Reality applications based on OpenCv"
  http://www.uco.es/investiga/grupos/ava/node/26
*/

import { type CVContour, adaptiveThreshold, approxPolyDP, countNonZero, findContours, grayscale, isContourConvex, minEdgeLength, otsu, perimeter, threshold, warp } from './cv';

export interface Marker {
  id: number
  corners: CVContour
}

export class Detector {
  binary: number[] = [];
  contours: CVContour[] = [];
  polys: CVContour[] = [];
  candidates: CVContour[] = [];
  grey: ImageData | null = null;
  thres: ImageData | null = null;

  detect (image: ImageData): Marker[] {
    this.grey = grayscale(image);
    this.thres = adaptiveThreshold(this.grey, 2, 7);

    this.contours = findContours(this.thres, this.binary);

    this.candidates = this.findCandidates(this.contours, image.width * 0.20, 0.05, 10);
    this.candidates = this.clockwiseCorners(this.candidates);
    this.candidates = this.notTooNear(this.candidates, 10);

    return this.findMarkers(this.grey, this.candidates, 49);
  }

  findCandidates (contours: CVContour[], minSize: number, epsilon: number, minLength: number): CVContour[] {
    const candidates: CVContour[] = [];

    const len = contours.length;
    let contour;

    this.polys = [];

    for (let i = 0; i < len; ++i) {
      contour = contours[i];

      if (contour.points.length >= minSize) {
        const poly = approxPolyDP(contour.points, contour.points.length * epsilon);

        this.polys.push({
          points: poly,
          hole: false,
          tooNear: false
        });

        if ((poly.length === 4) && (isContourConvex(poly))) {
          if (minEdgeLength(poly) >= minLength) {
            candidates.push({
              points: poly,
              hole: false,
              tooNear: false
            });
          }
        }
      }
    }

    return candidates;
  };

  clockwiseCorners (candidates: CVContour[]): CVContour[] {
    const len = candidates.length;

    for (let i = 0; i < len; ++i) {
      const candidatePoints = candidates[i].points;
      const dx1 = candidatePoints[1]?.x - candidatePoints[0].x;
      const dy1 = candidatePoints[1]?.y - candidatePoints[0].y;
      const dx2 = candidatePoints[2]?.x - candidatePoints[0].x;
      const dy2 = candidatePoints[2]?.y - candidatePoints[0].y;

      if ((dx1 * dy2 - dy1 * dx2) < 0) {
        const swap = candidatePoints[1];
        candidatePoints[1] = candidatePoints[3];
        candidatePoints[3] = swap;
      }
    }

    return candidates;
  };

  notTooNear (candidates: CVContour[], minDist: number): CVContour[] {
    const notTooNear: CVContour[] = [];
    const len = candidates.length;
    for (let i = 0; i < len; ++i) {
      for (let j = i + 1; j < len; ++j) {
        let dist = 0;

        for (let k = 0; k < 4; ++k) {
          const dx = candidates[i].points[k].x - candidates[j].points[k].x;
          const dy = candidates[i].points[k].y - candidates[j].points[k].y;

          dist += dx * dx + dy * dy;
        }

        if ((dist / 4) < (minDist * minDist)) {
          if (perimeter(candidates[i]) < perimeter(candidates[j])) {
            candidates[i].tooNear = true;
          } else {
            candidates[j].tooNear = true;
          }
        }
      }
    }

    for (let i = 0; i < len; ++i) {
      if (!candidates[i].tooNear) {
        notTooNear.push(candidates[i]);
      }
    }

    return notTooNear;
  };

  findMarkers (imageSrc: ImageData, candidates: CVContour[], warpSize: number): Marker[] {
    const markers: Marker[] = [];
    const len = candidates.length;

    for (let i = 0; i < len; ++i) {
      const candidate = candidates[i];

      const warped = warp(imageSrc, candidate, warpSize);
      const threshhold = threshold(warped, otsu(warped));

      const marker = this.getMarker(threshhold, candidate);
      if (marker !== null) {
        markers.push(marker);
      }
    }

    return markers;
  }

  getMarker (imageSrc: ImageData, candidate: CVContour): Marker | null {
    const width = (imageSrc.width / 7) >>> 0;
    const minZero = (width * width) >> 1;
    const bits: number[][] = [];
    const rotations: number[][][] = [];
    const distances: number[] = [];
    let square;
    let inc;

    for (let i = 0; i < 7; ++i) {
      inc = (i === 0 || i === 6) ? 1 : 6;

      for (let j = 0; j < 7; j += inc) {
        square = { x: j * width, y: i * width, width, height: width };
        if (countNonZero(imageSrc, square) > minZero) {
          return null;
        }
      }
    }

    for (let i = 0; i < 5; ++i) {
      bits[i] = [];

      for (let j = 0; j < 5; ++j) {
        square = { x: (j + 1) * width, y: (i + 1) * width, width, height: width };

        bits[i][j] = countNonZero(imageSrc, square) > minZero ? 1 : 0;
      }
    }

    rotations[0] = bits;
    distances[0] = this.hammingDistance(rotations[0]);

    const pair = { first: distances[0], second: 0 };

    for (let i = 1; i < 4; ++i) {
      rotations[i] = this.rotate(rotations[i - 1]);
      distances[i] = this.hammingDistance(rotations[i]);

      if (distances[i] < pair.first) {
        pair.first = distances[i];
        pair.second = i;
      }
    }

    if (pair.first !== 0) {
      return null;
    }

    return {
      id: this.mat2id(rotations[pair.second]),
      corners: this.rotate2(candidate, 4 - pair.second)
    };
  };

  hammingDistance (bits: number[][]): number {
    const ids = [[1, 0, 0, 0, 0], [1, 0, 1, 1, 1], [0, 1, 0, 0, 1], [0, 1, 1, 1, 0]];
    let dist = 0;

    for (let i = 0; i < 5; ++i) {
      let minSum = Infinity;

      for (let j = 0; j < 4; ++j) {
        let sum = 0;

        for (let k = 0; k < 5; ++k) {
          sum += bits[i][k] === ids[j][k] ? 0 : 1;
        }

        if (sum < minSum) {
          minSum = sum;
        }
      }

      dist += minSum;
    }

    return dist;
  };

  mat2id (bits: number[][]): number {
    let id = 0;

    for (let i = 0; i < 5; ++i) {
      id <<= 1;
      id |= bits[i][1];
      id <<= 1;
      id |= bits[i][3];
    }

    return id;
  }

  rotate (src: number[][]): number[][] {
    const dst: number[][] = [];
    const len = src.length;

    for (let i = 0; i < len; ++i) {
      dst[i] = [];
      for (let j = 0; j < src[i].length; ++j) {
        dst[i][j] = src[src[i].length - j - 1][i];
      }
    }

    return dst;
  }

  rotate2 (src: CVContour, rotation: number): CVContour {
    const dst: CVContour = {
      points: [],
      hole: false,
      tooNear: false
    };
    const len = src.points.length;

    for (let i = 0; i < len; ++i) {
      dst.points[i] = src.points[(rotation + i) % len];
    }
    return dst;
  }
}
