<template>
    <canvas></canvas>
</template>
<script>

export const getStream = (callback) => {
    navigator.getUserMedia({video: true}, (stream) => {
        console.log(stream)
        /** @type {HTMLVideoElement} */
        const video = document.getElementById('Input');
        video.srcObject = stream;
        video.play();
        let lastFrameTime = null;
        const feedLoop = () => {
            if (lastFrameTime !== video.currentTime) {
                lastFrameTime = video.currentTime;
                callback(video);

            }
            requestAnimationFrame(feedLoop);
        };
        feedLoop();
    }, console.error.bind(console))
}


getStream((video) => resize.in.image.value = video);

export default {
    mounted() {

    }
}
</script>
