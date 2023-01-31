import Node from './Node';
import {last} from 'lodash/array';
import {find} from 'lodash/collection';
import {NumberVar, StringVar, ImageVar} from './io/AbstractIOSet';

const outputs = {
    image: {
        type: 'Image'
    } as ImageVar,
    width: {
        type: 'Number',
    } as NumberVar,
    height: {
        type: 'Number',
    } as NumberVar,
    camera: {
        type: 'String',
        enum: [],
    } as StringVar
}

export default class Webcam extends Node<any, typeof outputs> {

    devices: MediaDeviceInfo[];
    currentDeviceId: string;
    video: HTMLVideoElement
    constructor(options) {
        super('Webcam', {}, outputs);
        this.start()
            .catch(console.error.bind(console))
    }

    async start() {
        this.devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
        this.out.camera.__definition.enum = this.devices.map(device => device.label)
        const deviceId = last(this.devices).deviceId;
        this.out.camera.value = this.getDeviceById(deviceId).label;

        await this.startDevice(deviceId)

        this.out.camera.onchange(async (label) => {
            this.video = null;
            const selectedDeviceId = this.getDeviceByLabel(label).deviceId;
            await this.startDevice(selectedDeviceId)
        })
    }

    private async startDevice(deviceId) {
        this.currentDeviceId = deviceId;
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { min: 480, ideal: 1920, max: 1920 },
                height: { min: 320, ideal: 1080, max: 1080 },
                deviceId
            },
        });
        /** @type {HTMLVideoElement} */
        this.video = document.createElement('video');
        // @ts-ignore
        this.video.playsinline = true;
        this.video.srcObject = stream;
        this.video.play();
        let lastFrameTime = null;
        const feedLoop = () => {
            if (!this.video) {
                return;
            }
            const currentTime = this.video.currentTime;
            if (lastFrameTime !== currentTime) {
                lastFrameTime = currentTime;
                // @ts-ignore
                this.out.image.value = this.video;
                // @ts-ignore
                this.out.width.value = this.video.videoWidth;
                // @ts-ignore
                this.out.height.value = this.video.videoHeight;
            }
            if (!this._stopped) {
                requestAnimationFrame(feedLoop);
            } else {
                this.video.src = null;
            }
        };
        feedLoop();
    }

    private getDeviceByLabel(label: string) {
        return find(this.devices, device => device.label === label);
    }

    private getDeviceById(id: string) {
        return find(this.devices, device => device.deviceId === id);
    }
}