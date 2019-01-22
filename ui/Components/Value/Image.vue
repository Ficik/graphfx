<template>
    <div
        class="image-value"
        @click="onClick"
    >
        <canvas class="image-value__thumb" ref="thumb" />
        <canvas class="image-value__preview" ref="preview" />
    </div>


</template>
<script>
import {paintToCanvas, mediaSize} from '../../../src/nodes/canvas.js'

export default {
    props: {
        io: {
            type: null,
            required: true,
        },
        value: {
            type: null,
            required: true,
        },
        direction: {
            type: String,
            required: true,
        }
    },
    watch: {
        value: {
            handler(value) {
                this.redraw();
            }
        }
    },
    data() {
        return {
            isRunning: true,
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.redraw();
            this.io.onchange(this.redraw);
        })
    },
    watch: {
        isRunning: {
            handler() {
                this.redraw();
            }
        }
    },
    beforeDestroy() {
        this.isRunning = false;
    },
    methods: {
        redrawCanvas(canvas) {
            const value = this.value;
            /** @type {HTMLCanvasElement} */
            const ctx = canvas.getContext('2d');
            if (!value) {
                canvas.width = 1;
                canvas.height = 1;
                ctx.clearRect(0, 0, 1, 1);
            } else {
                const {width, height} = mediaSize(value);
                canvas.width = width;
                canvas.height = height;
                paintToCanvas(canvas, value, {
                    top: 0,
                    left: 0,
                    width, height,
                });
            }
        },
        redraw() {
            if (this.isRunning) {
                this.redrawCanvas(this.$refs.thumb);
                this.redrawCanvas(this.$refs.preview)
            }
        },
        onClick() {
            if (this.direction === 'output') {
                this.download();
            } else {
                this.selectFile();
            }
        },
        selectFile() {
            const input = document.createElement('input');
            window.$$input = input;
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (event) => {
                const files = event.target.files;
                console.log(event);
                if (files.length) {
                    const fr = new FileReader()
                    fr.onload = (event) => {
                        const image = new Image();
                        image.onload = () => {
                            this.$emit('change', image);
                        }
                        image.src = event.target.result;
                    }
                    fr.readAsDataURL(files[0]);
                }
            }
            input.click();
        },
        download() {
            const a = document.createElement('a');
            a.href = this.$refs.preview.toDataURL();
            a.download = 'sample.png';
            a.click();
            console.log('download');
        }
    }
}
</script>
<style>
.image-value {
    position: relative;
}
.image-value__thumb {
    width: 50px;
    height: 50px;
    object-fit: contain;
    background-color: black;
    box-shadow: 0 0 6px;
}

.image-value__preview {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 30vw;
    height: 30vh;
    object-fit: contain;
    background-color: black;
    pointer-events: none;
    z-index: 1;
}

.image-value__thumb:hover ~ .image-value__preview {
    display: block;
}
</style>
