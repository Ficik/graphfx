<template>
    <canvas
        style="
            width: 150px;
            box-shadow: 0 0 6px;
        "
        @click="isRunning = !isRunning"
        />
</template>
<script>
import {paintToCanvas, mediaSize} from '../../../src/nodes/canvas.js'

export default {
    props: {
        value: {
            type: null,
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
            isRunning: false,
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.redraw();
            this.value.onchange(this.redraw);
        })
    },
    methods: {
        redraw() {
            if (this.isRunning) {
                const value = this.value.value;
                /** @type {HTMLCanvasElement} */
                const canvas = this.$el;
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
            }
        }
    }
}
</script>
