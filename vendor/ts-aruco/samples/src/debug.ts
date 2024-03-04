import { Detector, type Marker } from '../../src/aruco.ts';
import { type CVContour, otsu, threshold, warp } from '../../src/cv.ts';

let camera: HTMLVideoElement;
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let imageData: ImageData;
let detector: Detector;

let debugImage: ImageData;
let warpImage: ImageData;
let homographyImage: ImageData;

export const onLoad = (): void => {
  camera = document.getElementById('video') as HTMLVideoElement;
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
  context = canvas!.getContext('2d')!;

  camera.width = 320;
  camera.height = 240;

  canvas.width = parseInt(canvas.style.width);
  canvas.height = parseInt(canvas.style.height);

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      camera.srcObject = stream;
    })
    .catch(function (err) {
      console.log(err.name + ': ' + err.message);
    }
    );

  imageData = context.getImageData(0, 0, camera.width, camera.height);
  detector = new Detector();

  debugImage = context.createImageData(camera.width, camera.height);
  warpImage = context.createImageData(49, 49);

  requestAnimationFrame(tick);
};

const tick = (): void => {
  requestAnimationFrame(tick);

  if (camera.readyState === camera.HAVE_ENOUGH_DATA) {
    snapshot();

    const markers = detector.detect(imageData);
    drawDebug();
    drawCorners(markers);
    drawId(markers);
  }
};

const snapshot = (): void => {
  context.drawImage(camera, 0, 0, camera.width, camera.height);
  imageData = context.getImageData(0, 0, camera.width, camera.height);
};

const drawDebug = (): void => {
  const width = camera.width; const height = camera.height;

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.putImageData(imageData, 0, 0);
  context.putImageData(createImage(detector.grey!, debugImage), width, 0);
  context.putImageData(createImage(detector.thres!, debugImage), width * 2, 0);

  drawContours(detector.contours, 0, height, function (hole: any) { return hole ? 'magenta' : 'blue'; });
  drawContours(detector.polys, width, height, function () { return 'green'; });
  drawContours(detector.candidates, width * 2, height, function () { return 'red'; });

  drawWarps(detector.grey!, detector.candidates, height * 2 + 20);
};

const drawContours = (contours: CVContour[], x: number, y: number, fn: any): void => {
  let i = contours.length; let j; let contour; let point;

  while (i--) {
    contour = contours[i];

    context.strokeStyle = fn(contour.hole);
    context.beginPath();

    for (j = 0; j < contour.points?.length; ++j) {
      point = contour.points[j];
      context.moveTo(x + point.x, y + point.y);
      point = contour.points[(j + 1) % contour.points.length];
      context.lineTo(x + point.x, y + point.y);
    }

    context.stroke();
    context.closePath();
  }
};

const drawWarps = (imageSrc: ImageData, contours: CVContour[], y: number): void => {
  let i = contours.length;
  let contour;

  const offset = (canvas.width - ((warpImage.width + 10) * contours.length)) / 2;
  while (i--) {
    contour = contours[i];

    homographyImage = warp(imageSrc, contour, warpImage.width);
    context.putImageData(createImage(homographyImage, warpImage), offset + i * (warpImage.width + 10), y);

    homographyImage = threshold(homographyImage, otsu(homographyImage));
    context.putImageData(createImage(homographyImage, warpImage), offset + i * (warpImage.width + 10), y + 60);
  }
};

const drawCorners = (markers: Marker[]): void => {
  context.lineWidth = 3;

  for (let i = 0; i !== markers.length; ++i) {
    const corners = markers[i].corners.points;

    context.strokeStyle = 'red';
    context.beginPath();

    for (let j = 0; j !== corners.length; ++j) {
      let corner = corners[j];
      context.moveTo(corner.x, corner.y);
      corner = corners[(j + 1) % corners.length];
      context.lineTo(corner.x, corner.y);
    }

    context.stroke();
    context.closePath();

    context.strokeStyle = 'green';
    context.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
  }
};

const drawId = (markers: Marker[]): void => {
  context.strokeStyle = 'blue';
  context.lineWidth = 1;

  for (let i = 0; i !== markers.length; ++i) {
    const corners = markers[i].corners.points;

    let x = Infinity;
    let y = Infinity;

    for (let j = 0; j !== corners.length; ++j) {
      const corner = corners[j];
      x = Math.min(x, corner.x);
      y = Math.min(y, corner.y);
    }

    context.strokeText(`${markers[i].id}`, x, y);
  }
};

const createImage = (src: ImageData, dst: ImageData): ImageData => {
  let i = src.data.length; let j = (i * 4) + 3;

  while (i--) {
    dst.data[j -= 4] = 255;
    dst.data[j - 1] = dst.data[j - 2] = dst.data[j - 3] = src.data[i];
  }

  return dst;
};

window.onload = onLoad;
