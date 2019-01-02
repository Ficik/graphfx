export const sampleImage = (width, height) => {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d');

    const grd = ctx.createLinearGradient(0, 0, width, height);
    grd.addColorStop(0, "black");
    grd.addColorStop(1, "white");

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
    return c;
};


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
