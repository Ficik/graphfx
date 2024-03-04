import { Detector, type Marker } from '../../src/aruco';
import { type CVPoint } from '../../src/cv';
import { Posit } from '../../src/posit1';

import * as THREE from 'three';

let video: HTMLVideoElement;
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

let imageData: ImageData;
let detector: Detector;
let posit: Posit;
let renderer1: THREE.WebGLRenderer;
let renderer2: THREE.WebGLRenderer;
let renderer3: THREE.WebGLRenderer;
let scene1: THREE.Scene;
let scene2: THREE.Scene;
let scene3: THREE.Scene;
let scene4: THREE.Scene;

let camera1: THREE.PerspectiveCamera;
let camera2: THREE.PerspectiveCamera;
let camera3: THREE.OrthographicCamera;
let camera4: THREE.PerspectiveCamera;

let plane1: THREE.Object3D;
let plane2: THREE.Object3D;
let model: THREE.Object3D;
let texture: THREE.Object3D;
let step = 0.0;

const modelSize = 35.0; // millimeters

function onLoad(): void {
  video = document.getElementById('video') as HTMLVideoElement;
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
  context = canvas.getContext('2d') as CanvasRenderingContext2D;

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
  posit = new Posit(modelSize, canvas.width);

  createRenderers();
  createScenes();

  requestAnimationFrame(tick);
};

function tick(): void {
  requestAnimationFrame(tick);

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    snapshot();

    const markers: Marker[] = detector.detect(imageData);
    drawCorners(markers);
    updateScenes(markers);

    render();
  }
};

function snapshot(): void {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  imageData = context.getImageData(0, 0, canvas.width, canvas.height);
};

function drawCorners(markers: Marker[]): void {
  context.lineWidth = 3;

  for (let i = 0; i < markers.length; ++i) {
    const corners = markers[i].corners;

    context.strokeStyle = 'red';
    context.beginPath();

    for (let j = 0; j < corners.points.length; ++j) {
      let corner: CVPoint = corners.points[j];
      context.moveTo(corner.x, corner.y);
      corner = corners.points[(j + 1) % corners.points.length];
      context.lineTo(corner.x, corner.y);
    }

    context.stroke();
    context.closePath();

    context.strokeStyle = 'green';
    context.strokeRect(corners.points[0].x - 2, corners.points[0].y - 2, 4, 4);
  }
};

function createRenderers(): void {
  renderer1 = new THREE.WebGLRenderer();
  renderer1.setClearColor(0xffff00, 1);
  renderer1.setSize(canvas.width, canvas.height);
  document.getElementById('container1')!.appendChild(renderer1.domElement);
  scene1 = new THREE.Scene();
  camera1 = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 1, 1000);
  scene1.add(camera1);

  renderer2 = new THREE.WebGLRenderer();
  renderer2.setClearColor(0xffff00, 1);
  renderer2.setSize(canvas.width, canvas.height);
  document.getElementById('container2')!.appendChild(renderer2.domElement);
  scene2 = new THREE.Scene();
  camera2 = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 1, 1000);
  scene2.add(camera2);

  renderer3 = new THREE.WebGLRenderer();
  renderer3.setClearColor(0xffffff, 1);
  renderer3.setSize(canvas.width, canvas.height);
  document.getElementById('container')!.appendChild(renderer3.domElement);

  scene3 = new THREE.Scene();
  camera3 = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
  scene3.add(camera3);

  scene4 = new THREE.Scene();
  camera4 = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 1, 1000);
  scene4.add(camera4);
};

function render(): void {
  renderer1.clear();
  renderer1.render(scene1, camera1);

  renderer2.clear();
  renderer2.render(scene2, camera2);

  renderer3.autoClear = false;
  renderer3.clear();
  renderer3.render(scene3, camera3);
  renderer3.render(scene4, camera4);
};

function createScenes(): void {
  plane1 = createPlane();
  scene1.add(plane1);

  plane2 = createPlane();
  scene2.add(plane2);

  texture = createTexture();
  scene3.add(texture);

  model = createModel();
  scene4.add(model);
};

function createPlane(): THREE.Object3D {
  const object = new THREE.Object3D();
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshNormalMaterial();
  const mesh = new THREE.Mesh(geometry, material);

  object.rotation.order = 'YXZ';

  object.add(mesh);

  return object;
};

function createTexture(): THREE.Object3D {
  const texture = new THREE.VideoTexture(video);
  const object = new THREE.Object3D();
  const geometry = new THREE.PlaneGeometry(1.0, 1.0);
  const material = new THREE.MeshBasicMaterial({ map: texture, depthTest: false, depthWrite: false });
  const mesh = new THREE.Mesh(geometry, material);

  object.position.z = -1;

  object.add(mesh);

  return object;
};

function createModel(): THREE.Object3D {
  const object = new THREE.Object3D();
  const geometry = new THREE.SphereGeometry(0.5, 15, 15, Math.PI);

  const texture = new THREE.TextureLoader().load('earth.jpg');
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const mesh = new THREE.Mesh(geometry, material);

  object.add(mesh);

  return object;
};

function updateScenes(markers: Marker[]): void {
  if (markers.length > 0) {
    const corners = markers[0].corners;

    for (let i = 0; i < corners.points.length; ++i) {
      const corner = corners.points[i];

      corner.x = corner.x - (canvas.width / 2);
      corner.y = (canvas.height / 2) - corner.y;
    }

    const pose = posit.pose(corners.points);

    updateObject(plane1, pose.bestRotation, pose.bestTranslation);
    updateObject(plane2, pose.alternativeRotation, pose.alternativeTranslation);
    updateObject(model, pose.bestRotation, pose.bestTranslation);

    updatePose('pose1', pose.bestError, pose.bestRotation, pose.bestTranslation);
    updatePose('pose2', pose.alternativeError, pose.alternativeRotation, pose.alternativeTranslation);

    step += 0.025;

    model.rotation.z -= step;
  }
  // //@ts-ignore
  //texture.children[0].material.map.needsUpdate = true;
};

function updateObject(object: THREE.Object3D, rotation: number[][], translation: number[]): void {
  object.scale.x = modelSize;
  object.scale.y = modelSize;
  object.scale.z = modelSize;

  object.rotation.x = -Math.asin(-rotation[1][2]);
  object.rotation.y = -Math.atan2(rotation[0][2], rotation[2][2]);
  object.rotation.z = Math.atan2(rotation[1][0], rotation[1][1]);

  object.position.x = translation[0];
  object.position.y = translation[1];
  object.position.z = -translation[2];
};

function updatePose(id: string, error: number, rotation: number[][], translation: number[]): void {
  const yaw = -Math.atan2(rotation[0][2], rotation[2][2]);
  const pitch = -Math.asin(-rotation[1][2]);
  const roll = Math.atan2(rotation[1][0], rotation[1][1]);

  const d = document.getElementById(id);
  if (d !== null) {
    d.innerHTML = ' error: ' + error +
      '<br/>' +
      ' x: ' + (translation[0] | 0) +
      ' y: ' + (translation[1] | 0) +
      ' z: ' + (translation[2] | 0) +
      '<br/>' +
      ' yaw: ' + Math.round(-yaw * 180.0 / Math.PI) +
      ' pitch: ' + Math.round(-pitch * 180.0 / Math.PI) +
      ' roll: ' + Math.round(roll * 180.0 / Math.PI);
  }
};

window.onload = onLoad;
