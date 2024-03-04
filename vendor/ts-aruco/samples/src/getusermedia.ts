import { Detector, type Marker } from '../../src/aruco.ts';

let video: HTMLVideoElement;
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let imageData: ImageData;
let detector: Detector;

const onLoad = (): void => {
  video = document.getElementById('video')! as HTMLVideoElement;
  canvas = document.getElementById('canvas')! as HTMLCanvasElement;
  context = canvas.getContext('2d')!;

  canvas.width = parseInt(canvas.style.width);
  canvas.height = parseInt(canvas.style.height);

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (err) {
      console.log(err.name + ': ' + err.message);
    }
    );

  detector = new Detector();

  requestAnimationFrame(tick);
};

const tick = (): void => {
  requestAnimationFrame(tick);

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    snapshot();
    const markers = detector.detect(imageData);
    drawCorners(markers);
    drawId(markers);
  }
};

const snapshot = (): void => {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  imageData = context.getImageData(0, 0, canvas.width, canvas.height);
};

const drawCorners = (markers: Marker[]): void => {
  let corners, corner, i, j;

  context.lineWidth = 3;

  for (i = 0; i !== markers.length; ++i) {
    corners = markers[i].corners.points;

    context.strokeStyle = 'red';
    context.beginPath();

    for (j = 0; j !== corners.length; ++j) {
      corner = corners[j];
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
  let corners, corner, x, y, i, j;

  context.strokeStyle = 'blue';
  context.lineWidth = 1;

  for (i = 0; i !== markers.length; ++i) {
    corners = markers[i].corners.points;

    x = Infinity;
    y = Infinity;

    for (j = 0; j !== corners.length; ++j) {
      corner = corners[j];

      x = Math.min(x, corner.x);
      y = Math.min(y, corner.y);
    }

    context.strokeText(`${markers[i].id}`, x, y);
  }
};

window.onload = onLoad;
