import Node from './Node';

export default class ToBlob extends Node {

    constructor(options) {
        super('Webcam', {}, {
            image: {
                type: 'Image'
            },
            width: {
                type: 'Number',
            },
            height: {
                type: 'Number',
            }
        });
        this.start();
    }


    async start() {
        const devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput')
        const last = (ary) => ary[ary.length - 1];
        console.log(last(devices));
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { min: 480, ideal: 1920, max: 1920 },
                height: { min: 320, ideal: 1080, max: 1080 },
                deviceId: last(devices).deviceId
            },
        });
        console.log(stream)
        /** @type {HTMLVideoElement} */

        const video = document.createElement('video');
        video.playsinline = true;
        video.srcObject = stream;
        video.play();
        let lastFrameTime = null;
        const feedLoop = () => {
            const currentTime = video.currentTime;
            if (lastFrameTime !== currentTime) {
                lastFrameTime = currentTime;
                this.out.image.value = video;
                this.out.width.value = video.videoWidth;
                this.out.height.value = video.videoHeight;
            }
            requestAnimationFrame(feedLoop);
        };
        feedLoop();
    }
}