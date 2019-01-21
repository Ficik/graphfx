import * as nodes from '../src/nodes';
import {sampleImage, getStream} from './helpers';
/*
const resize = new nodes.Resize({
    width: 1000,
    height: 1000,
    method: 'cover'
});

const brightnessContrast = new nodes.BrightnessContrast({})
const hsv = new nodes.HSV({})
const sepia = new nodes.Sepia({})

const compose = new nodes.Compose({
    width: 1200,
    height: 1800,
});

compose.in.fgX.value = 100;
compose.in.fgY.value = 100;
compose.in.bg.value = sampleImage(1200, 1800);

brightnessContrast.in.image.connect(resize.out.image);
hsv.in.image.connect(brightnessContrast.out.image);
sepia.in.image.connect(hsv.out.image);
compose.in.fg.connect(sepia.out.image);

getStream((video) => resize.in.image.value = video);
*/
