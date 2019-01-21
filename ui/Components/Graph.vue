<template>
    <div class="graph">
        <canvas
            v-if="boundingRect"
            class="graph__bg"
            ref="bg"
            :width="boundingRect.width"
            :height="boundingRect.height"
            @click="showContextMenu"
        ></canvas>
        <Draggable
            v-for="(node, index) in graph"
            :key="index"
            @move="updateNodePosition(node, $event)"
        >
            <Node
                class="graph__node"
                :style="{transform: `translate(${node.x}px, ${node.y}px)`}"
                :node="node.node"
                ref="node"
                :selectedInput="selectedInput"
                :selectedOutput="selectedOutput"
                @outputSelected="selectedOutput = $event"
                @inputSelected="selectedInput = $event"
            />
        </Draggable>
        <ContextMenu
            :open="!!contextMenuPosition"
            :position="contextMenuPosition"
            :items="availableNodes"
            @selected="addNode"
        />
    </div>
</template>
<script>
import * as nodes from '../../src/nodes';
import Node from './Node.vue';
import Draggable from './Drag/Draggable.js';
import ContextMenu from './ContextMenu.vue';

export default {
    components: {
        ContextMenu,
        Draggable,
        Node,
    },
    props: {
        graph: {
            type: Array,
            required: true,
        }
    },
    data() {
        return {
            selectedOutput: null,
            selectedInput: null,
            boundingRect: null,
            contextMenuPosition: null,
        }
    },
    watch: {
        selectedOutput() {
            this.tryConnectIO();
        },
        selectedInput() {
            this.tryConnectIO();
        },
        graph: {
            deep: true,
            handler() {
                this.drawConnections();
            }
        }
    },
    methods: {
        showContextMenu(event) {
            const {offsetX, offsetY} = event;
            if (this.contextMenuPosition) {
                this.contextMenuPosition = null;
            } else {
                this.contextMenuPosition = {
                    x: offsetX,
                    y: offsetY,
                };
            }
        },
        updateNodePosition(node, {clientX, clientY, x0, y0}) {
            const x = clientX - this.$el.offsetLeft;
            const y = clientY - this.$el.offsetTop;
            console.log('updateNodePosition', x, y)
            node.x = x;
            node.y = y;
        },
        tryConnectIO() {
            if (this.selectedInput && this.selectedOutput) {
                this.selectedInput.connect(this.selectedOutput);
                this.selectedInput = null;
                this.selectedOutput = null;
            }
        },
        recomputeSize() {
            this.boundingRect = this.$el.getBoundingClientRect();
        },
        drawConnections() {
            try {
                const flattenObjectArray = (ary) =>
                    ary.reduce((acc, nxt) => Object.assign(acc, nxt), {});
                const inputs = flattenObjectArray(this.$refs.node
                    .map((vm) => vm.inputPositions()));
                const outputs = flattenObjectArray(this.$refs.node
                    .map((vm) => vm.outputPositions()));

                const bg = this.$refs.bg;
                const ctx = bg.getContext('2d');
                ctx.clearRect(0, 0, bg.width, bg.height);
                ctx.strokeStyle = "#eaa11a";
                ctx.lineWidth = 3;
                for (let input of Object.values(inputs)) {
                    if (!input.output) continue;
                    const output = outputs[input.output.id];
                    ctx.beginPath();
                    ctx.moveTo(input.rect.left, input.rect.top);
                    const halfWay = {x: (input.rect.left + output.rect.right)/2, y: (input.rect.y + output.rect.y)/2};
                    ctx.bezierCurveTo(
                        Math.min(halfWay.x, input.rect.left - Math.max(Math.abs(halfWay.x - input.rect.left), 50)), input.rect.top,
                        Math.max(halfWay.x, output.rect.right + Math.max(Math.abs(halfWay.x - output.rect.right), 50)), output.rect.top,
                        // Math.min(halfWay.x, output.rect.right - (halfWay.x - output.rect.right)), output.rect.top,
                        //halfWay.x, output.rect.top,
                        output.rect.right, output.rect.top
                    );
                    ctx.stroke();
                }
            } catch (err) {
                console.warn('drawConnection', err);
            }
        },
        addNode({x, y, item: {node}}) {
            this.graph.push({
                x, y,
                node: new node(),
            });
            this.contextMenuPosition = null;
        }
    },
    computed: {
        availableNodes() {
            return Object.keys(nodes)
                .map((name) => ({
                    label: name,
                    node: nodes[name],
                }))
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.recomputeSize();
            this.drawConnections();
        })
    }
}
</script>
<style>
.graph {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(#333333, #151515);
}

.graph__node {
    position: absolute;
}

.graph__bg {
    position: absolute;
    top: 0;
    left: 0;
}
</style>

