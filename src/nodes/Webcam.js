import Node from './Node';

export default class ToBlob extends Node {

    constructor(options) {
        super('Webcam', {}, {
            image: {
                type: 'Image'
            },
        });
        this.start();
    }


    async start() {
        const devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput')
        const last = (ary) => ary[ary.length - 1];
        console.log(last(devices));
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { min: 1024, ideal: 1920, max: 1920 },
                height: { min: 776, ideal: 1080, max: 1080 },
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
            if (lastFrameTime !== video.currentTime) {
                lastFrameTime = video.currentTime;
                this.out.image.value = video;
            }
            requestAnimationFrame(feedLoop);
        };
        feedLoop();
    }
}