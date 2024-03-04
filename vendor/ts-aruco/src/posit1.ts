/*
Copyright (c) 2012 Juan Mellado

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

import { type CVPoint } from './cv';
import { svdcmp } from './svd';

/*
References:
- "Iterative Pose Estimation using Coplanar Feature Points"
  Denis Oberkampf, Daniel F. DeMenthon, Larry S. Davis
  http://www.cfar.umd.edu/~daniel/daniel_papersfordownload/CoplanarPts.pdf
*/

class Pose {
  bestError: any;
  bestRotation: any;
  bestTranslation: any;
  alternativeError: any;
  alternativeRotation: any;
  alternativeTranslation: any;

  constructor(error1: number, rotation1: number[][], translation1: number[], error2: number, rotation2: number[][], translation2: number[]) {
    this.bestError = error1;
    this.bestRotation = rotation1;
    this.bestTranslation = translation1;
    this.alternativeError = error2;
    this.alternativeRotation = rotation2;
    this.alternativeTranslation = translation2;
  }
}

export class Posit {
  objectPoints: number[][];
  focalLength: number;
  objectVectors: number[][];
  objectNormal: number[];
  objectMatrix: number[][];

  constructor(modelSize: number, focalLength: number) {
    this.objectPoints = this.buildModel(modelSize);
    this.focalLength = focalLength;

    this.objectVectors = [];
    this.objectNormal = [];
    this.objectMatrix = [[], [], []];

    this.init();
  };

  buildModel(modelSize: number): number[][] {
    const half = modelSize / 2.0;

    return [
      [-half, half, 0.0],
      [half, half, 0.0],
      [half, -half, 0.0],
      [-half, -half, 0.0]];
  }

  init(): void {
    const np = this.objectPoints.length;
    const vectors: number[][] = []; const n: any[] = []; let len = 0.0; let row = 2;

    for (let i = 0; i < np; ++i) {
      this.objectVectors[i] = [this.objectPoints[i][0] - this.objectPoints[0][0],
      this.objectPoints[i][1] - this.objectPoints[0][1],
      this.objectPoints[i][2] - this.objectPoints[0][2]];

      vectors[i] = [this.objectVectors[i][0],
      this.objectVectors[i][1],
      this.objectVectors[i][2]];
    }

    while (len === 0.0) {
      n[0] = this.objectVectors[1][1] * this.objectVectors[row][2] -
        this.objectVectors[1][2] * this.objectVectors[row][1];
      n[1] = this.objectVectors[1][2] * this.objectVectors[row][0] -
        this.objectVectors[1][0] * this.objectVectors[row][2];
      n[2] = this.objectVectors[1][0] * this.objectVectors[row][1] -
        this.objectVectors[1][1] * this.objectVectors[row][0];

      len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);

      ++row;
    }

    for (let i = 0; i < 3; ++i) {
      this.objectNormal[i] = n[i] / len;
    }

    this.pseudoInverse(vectors, np, this.objectMatrix);
  }

  pose(imagePoints: CVPoint[]): Pose {
    const posRotation1 = [[], [], []]; const posRotation2 = [[], [], []];
    const posTranslation: number[] = [];
    const rotation1 = [[], [], []]; const rotation2 = [[], [], []];
    const translation1: number[] = [];
    const translation2: number[] = [];
    let error1; let error2; let i; let j;

    this.pos(imagePoints, posRotation1, posRotation2, posTranslation);

    const valid1 = this.isValid(posRotation1, posTranslation);
    if (valid1) {
      error1 = this.iterate(imagePoints, posRotation1, posTranslation, rotation1, translation1);
    } else {
      error1 = { euclidean: -1.0, pixels: -1, maximum: -1.0 };
    }

    const valid2 = this.isValid(posRotation2, posTranslation);
    if (valid2) {
      error2 = this.iterate(imagePoints, posRotation2, posTranslation, rotation2, translation2);
    } else {
      error2 = { euclidean: -1.0, pixels: -1, maximum: -1.0 };
    }

    for (i = 0; i < 3; ++i) {
      for (j = 0; j < 3; ++j) {
        if (valid1) {
          translation1[i] -= rotation1[i][j] * this.objectPoints[0][j];
        }
        if (valid2) {
          translation2[i] -= rotation2[i][j] * this.objectPoints[0][j];
        }
      }
    }

    return error1.euclidean < error2.euclidean
      ? new Pose(error1.pixels, rotation1, translation1, error2.pixels, rotation2, translation2)
      : new Pose(error2.pixels, rotation2, translation2, error1.pixels, rotation1, translation1);
  };

  pos(imagePoints: CVPoint[], rotation1: number[][], rotation2: number[][], translation: number[]): void {
    const np = this.objectPoints.length; const imageVectors: any[] = [];
    const i0: number[] = []; const j0: number[] = []; const ivec: number[] = []; const jvec: number[] = []; const row1: number[] = []; const row2: number[] = []; const row3: number[] = [];
    let i0i0; let j0j0; let i0j0; let delta; let q; let lambda; let mu; let scale; let i; let j;

    for (i = 0; i < np; ++i) {
      imageVectors[i] = [imagePoints[i].x - imagePoints[0].x,
      imagePoints[i].y - imagePoints[0].y];
    }

    // i0 and j0
    for (i = 0; i < 3; ++i) {
      i0[i] = 0.0;
      j0[i] = 0.0;
      for (j = 0; j < np; ++j) {
        i0[i] += this.objectMatrix[i][j] * imageVectors[j][0];
        j0[i] += this.objectMatrix[i][j] * imageVectors[j][1];
      }
    }

    i0i0 = i0[0] * i0[0] + i0[1] * i0[1] + i0[2] * i0[2];
    j0j0 = j0[0] * j0[0] + j0[1] * j0[1] + j0[2] * j0[2];
    i0j0 = i0[0] * j0[0] + i0[1] * j0[1] + i0[2] * j0[2];

    // Lambda and mu
    delta = (j0j0 - i0i0) * (j0j0 - i0i0) + 4.0 * (i0j0 * i0j0);

    if (j0j0 - i0i0 >= 0.0) {
      q = (j0j0 - i0i0 + Math.sqrt(delta)) / 2.0;
    } else {
      q = (j0j0 - i0i0 - Math.sqrt(delta)) / 2.0;
    }

    if (q >= 0.0) {
      lambda = Math.sqrt(q);
      if (lambda === 0.0) {
        mu = 0.0;
      } else {
        mu = -i0j0 / lambda;
      }
    } else {
      lambda = Math.sqrt(-(i0j0 * i0j0) / q);
      if (lambda === 0.0) {
        mu = Math.sqrt(i0i0 - j0j0);
      } else {
        mu = -i0j0 / lambda;
      }
    }

    // First rotation
    for (i = 0; i < 3; ++i) {
      ivec[i] = i0[i] + lambda * this.objectNormal[i];
      jvec[i] = j0[i] + mu * this.objectNormal[i];
    }

    scale = Math.sqrt(ivec[0] * ivec[0] + ivec[1] * ivec[1] + ivec[2] * ivec[2]);

    for (i = 0; i < 3; ++i) {
      row1[i] = ivec[i] / scale;
      row2[i] = jvec[i] / scale;
    }

    row3[0] = row1[1] * row2[2] - row1[2] * row2[1];
    row3[1] = row1[2] * row2[0] - row1[0] * row2[2];
    row3[2] = row1[0] * row2[1] - row1[1] * row2[0];

    for (i = 0; i < 3; ++i) {
      rotation1[0][i] = row1[i];
      rotation1[1][i] = row2[i];
      rotation1[2][i] = row3[i];
    }

    // Second rotation
    for (i = 0; i < 3; ++i) {
      ivec[i] = i0[i] - lambda * this.objectNormal[i];
      jvec[i] = j0[i] - mu * this.objectNormal[i];
    }

    for (i = 0; i < 3; ++i) {
      row1[i] = ivec[i] / scale;
      row2[i] = jvec[i] / scale;
    }

    row3[0] = row1[1] * row2[2] - row1[2] * row2[1];
    row3[1] = row1[2] * row2[0] - row1[0] * row2[2];
    row3[2] = row1[0] * row2[1] - row1[1] * row2[0];

    for (i = 0; i < 3; ++i) {
      rotation2[0][i] = row1[i];
      rotation2[1][i] = row2[i];
      rotation2[2][i] = row3[i];
    }

    // Translation
    translation[0] = imagePoints[0].x / scale;
    translation[1] = imagePoints[0].y / scale;
    translation[2] = this.focalLength / scale;
  }

  isValid(rotation: number[][], translation: number[]): boolean {
    const np = this.objectPoints.length; let zmin = Infinity; let i = 0; let zi;

    for (; i < np; ++i) {
      zi = translation[2] +
        (rotation[2][0] * this.objectVectors[i][0] +
          rotation[2][1] * this.objectVectors[i][1] +
          rotation[2][2] * this.objectVectors[i][2]);
      if (zi < zmin) {
        zmin = zi;
      }
    }

    return zmin >= 0.0;
  }

  iterate(imagePoints: CVPoint[], posRotation: any[][], posTranslation: any[], rotation: number[][], translation: number[]) {
    const np = this.objectPoints.length;
    const oldSopImagePoints: CVPoint[] = []; const sopImagePoints: CVPoint[] = [];
    const rotation1 = [[], [], []]; const rotation2 = [[], [], []];
    const translation1: number[] = []; const translation2: number[] = [];
    let converged = false; let iteration = 0;
    let oldImageDifference; let imageDifference; let factor;
    let error; let error1; let error2; let delta; let i; let j;

    for (i = 0; i < np; ++i) {
      oldSopImagePoints[i] = {
        x: imagePoints[i].x,
        y: imagePoints[i].y
      };
    }

    for (i = 0; i < 3; ++i) {
      for (j = 0; j < 3; ++j) {
        rotation[i][j] = posRotation[i][j];
      }
      translation[i] = posTranslation[i];
    }

    for (i = 0; i < np; ++i) {
      factor = 0.0;
      for (j = 0; j < 3; ++j) {
        factor += this.objectVectors[i][j] * rotation[2][j] / translation[2];
      }
      sopImagePoints[i] = {
        x: (1.0 + factor) * imagePoints[i].x,
        y: (1.0 + factor) * imagePoints[i].y
      };
    }

    imageDifference = 0.0;

    for (i = 0; i < np; ++i) {
      imageDifference += Math.abs(sopImagePoints[i].x - oldSopImagePoints[i].x);
      imageDifference += Math.abs(sopImagePoints[i].y - oldSopImagePoints[i].y);
    }

    for (i = 0; i < 3; ++i) {
      translation1[i] = translation[i] -
        (rotation[i][0] * this.objectPoints[0][0] +
          rotation[i][1] * this.objectPoints[0][1] +
          rotation[i][2] * this.objectPoints[0][2]);
    }

    error = error1 = this.error(imagePoints, rotation, translation1);

    // Convergence
    converged = (error1.pixels === 0.0) || (imageDifference < 0.01);

    while (iteration++ < 100 && !converged) {
      for (i = 0; i < np; ++i) {
        oldSopImagePoints[i].x = sopImagePoints[i].x;
        oldSopImagePoints[i].y = sopImagePoints[i].y;
      }

      this.pos(sopImagePoints, rotation1, rotation2, translation);

      for (i = 0; i < 3; ++i) {
        translation1[i] = translation[i] -
          (rotation1[i][0] * this.objectPoints[0][0] +
            rotation1[i][1] * this.objectPoints[0][1] +
            rotation1[i][2] * this.objectPoints[0][2]);

        translation2[i] = translation[i] -
          (rotation2[i][0] * this.objectPoints[0][0] +
            rotation2[i][1] * this.objectPoints[0][1] +
            rotation2[i][2] * this.objectPoints[0][2]);
      }

      error1 = this.error(imagePoints, rotation1, translation1);
      error2 = this.error(imagePoints, rotation2, translation2);

      if ((error1.euclidean >= 0.0) && (error2.euclidean >= 0.0)) {
        if (error2.euclidean < error1.euclidean) {
          error = error2;
          for (i = 0; i < 3; ++i) {
            for (j = 0; j < 3; ++j) {
              rotation[i][j] = rotation2[i][j];
            }
          }
        } else {
          error = error1;
          for (i = 0; i < 3; ++i) {
            for (j = 0; j < 3; ++j) {
              rotation[i][j] = rotation1[i][j];
            }
          }
        }
      }

      if ((error1.euclidean < 0.0) && (error2.euclidean >= 0.0)) {
        error = error2;
        for (i = 0; i < 3; ++i) {
          for (j = 0; j < 3; ++j) {
            rotation[i][j] = rotation2[i][j];
          }
        }
      }

      if ((error2.euclidean < 0.0) && (error1.euclidean >= 0.0)) {
        error = error1;
        for (i = 0; i < 3; ++i) {
          for (j = 0; j < 3; ++j) {
            rotation[i][j] = rotation1[i][j];
          }
        }
      }

      for (i = 0; i < np; ++i) {
        factor = 0.0;
        for (j = 0; j < 3; ++j) {
          factor += this.objectVectors[i][j] * rotation[2][j] / translation[2];
        }
        sopImagePoints[i].x = (1.0 + factor) * imagePoints[i].x;
        sopImagePoints[i].y = (1.0 + factor) * imagePoints[i].y;
      }

      oldImageDifference = imageDifference;
      imageDifference = 0.0;

      for (i = 0; i < np; ++i) {
        imageDifference += Math.abs(sopImagePoints[i].x - oldSopImagePoints[i].x);
        imageDifference += Math.abs(sopImagePoints[i].y - oldSopImagePoints[i].y);
      }

      delta = Math.abs(imageDifference - oldImageDifference);

      converged = (error.pixels === 0.0) || (delta < 0.01);
    }

    return error;
  }

  error(imagePoints: CVPoint[], rotation: number[][], translation: number[]) {
    const np = this.objectPoints.length;
    const move: number[][] = []; const projection: number[][] = []; const errorvec: number[][] = [];
    let euclidean = 0.0; let pixels = 0.0; let maximum = 0.0;
    let i; let j; let k;

    if (!this.isValid(rotation, translation)) {
      return { euclidean: -1.0, pixels: -1, maximum: -1.0 };
    }

    for (i = 0; i < np; ++i) {
      move[i] = [];
      for (j = 0; j < 3; ++j) {
        move[i][j] = translation[j];
      }
    }

    for (i = 0; i < np; ++i) {
      for (j = 0; j < 3; ++j) {
        for (k = 0; k < 3; ++k) {
          move[i][j] += rotation[j][k] * this.objectPoints[i][k];
        }
      }
    }

    for (i = 0; i < np; ++i) {
      projection[i] = [];
      for (j = 0; j < 2; ++j) {
        projection[i][j] = this.focalLength * move[i][j] / move[i][2];
      }
    }

    for (i = 0; i < np; ++i) {
      errorvec[i] = [projection[i][0] - imagePoints[i].x,
      projection[i][1] - imagePoints[i].y];
    }

    for (i = 0; i < np; ++i) {
      euclidean += Math.sqrt(errorvec[i][0] * errorvec[i][0] +
        errorvec[i][1] * errorvec[i][1]);

      pixels += Math.abs(Math.round(projection[i][0]) - Math.round(imagePoints[i].x)) +
        Math.abs(Math.round(projection[i][1]) - Math.round(imagePoints[i].y));

      if (Math.abs(errorvec[i][0]) > maximum) {
        maximum = Math.abs(errorvec[i][0]);
      }
      if (Math.abs(errorvec[i][1]) > maximum) {
        maximum = Math.abs(errorvec[i][1]);
      }
    }

    return { euclidean: euclidean / np, pixels, maximum };
  }

  pseudoInverse(a: number[][], n: number, b: number[][]): void {
    const w: number[] = []; const v = [[], [], []]; const s: number[][] = [[], [], []];
    let wmax = 0.0; let cn = 0;
    let i: number; let j: number; let k: number;

    svdcmp(a, n, 3, w, v);

    for (i = 0; i < 3; ++i) {
      if (w[i] > wmax) {
        wmax = w[i];
      }
    }

    wmax *= 0.01;

    for (i = 0; i < 3; ++i) {
      if (w[i] < wmax) {
        w[i] = 0.0;
      }
    }

    for (j = 0; j < 3; ++j) {
      if (w[j] === 0.0) {
        ++cn;
        for (k = j; k < 2; ++k) {
          for (i = 0; i < n; ++i) {
            a[i][k] = a[i][k + 1];
          }
          for (i = 0; i < 3; ++i) {
            v[i][k] = v[i][k + 1];
          }
        }
      }
    }

    for (j = 0; j < 2; ++j) {
      if (w[j] === 0.0) {
        w[j] = w[j + 1];
      }
    }

    for (i = 0; i < 3; ++i) {
      for (j = 0; j < 3 - cn; ++j) {
        s[i][j] = v[i][j] / w[j];
      }
    }

    for (i = 0; i < 3; ++i) {
      for (j = 0; j < n; ++j) {
        b[i][j] = 0.0;
        for (k = 0; k < 3 - cn; ++k) {
          b[i][j] += s[i][k] * a[j][k];
        }
      }
    }
  }
}
