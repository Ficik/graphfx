<template>
    <div
        class="node"
    >
        <div
            class="node__title"
        >{{node.name}}</div>
        <div class="node__vars node__vars--input">
            <div
                v-for="(type, name) in node.in.variables"
                :key="name"
                :ref="`in-${name}`"
                class="node__var node-var node-var--input"
                :class="{'node-var--selected': node.in[name] === selectedInput }"
            >
                <div
                    class="node-var__label"
                    @click="$emit('inputSelected', node.in[name])"
                >
                {{ name }} <!--<i>{{typeName(type)}}</i> -->
                <span
                    v-if="node.in[name].output"
                    @click.stop="node.in[name].disconnect()"
                >&times;</span>
                </div>
                <Value
                    :io="node.in[name]"
                    direction="input"
                    @change="(value) => node.in[name].value = value"
                    class="node-var__value"
                />
            </div>
        </div>
        <div  class="node__vars node__vars--output">
            <div
                v-for="(type, name) in node.out.variables"
                :key="name"
                :ref="`out-${name}`"
                class="node__var node-var node-var--output"
                :class="{'node-var--selected': node.out[name] === selectedOutput }"
            >
                <div
                    class="node-var__label"
                    @click="$emit('outputSelected', node.out[name])"
                >{{ name }} <!--<i>{{typeName(type)}}</i>--></div>
                <Value
                    :io="node.out[name]"
                    direction="output"
                    class="node-var__value"
                />
            </div>
        </div>
        <div
            class="node__remove"
            @click="removeNode"
        >
            &times;
        </div>
    </div>
</template>
<script>
import Value from './Value';

export default {
    components: {
        Value,
    },
    props: {
        selectedInput: {
            type: Object,
            default: null
        },
        selectedOutput: {
            type: Object,
            default: null
        },
        node: {
            type: Object,
            required: true,
        }
    },
    methods: {
        typeName(type) {
            return Array.isArray(type) ? 'Option' : type;
        },
        outputPositions() {
            const outs = {};
            for (let out in this.node.out.variables) {
                outs[this.node.out[out].id] = {
                    rect: this.$refs[`out-${out}`][0].getBoundingClientRect(),
                }
            }
            return outs;
        },
        inputPositions() {
            const ins = {};
            for (let i in this.node.in.variables) {
                ins[this.node.in[i].id] = {
                    output: this.node.in[i].output,
                    rect: this.$refs[`in-${i}`][0].getBoundingClientRect(),
                }
            }
            return ins;
        },
        removeNode() {
            this.$emit('removeNode', this.node);
        }
    }
}
</script>
<style>
.node-var {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

}
.node-var__label {
  width: 5em;
  display: inline-block;
}

.node-var__value {
  width: 5em;
  display: inline-block;
}

.node-var--selected {
    font-weight: bold;
}

.node-var--input {
    border-left: 5px solid green;
    padding-left: 4px;
}

.node-var--output {
    border-right: 5px solid orange;
    padding-right: 4px;
    flex-direction: row-reverse;
}

.node {
    margin: 5px;
    padding: 5px 0;
    display: grid;
    flex-direction: row;
    background-color: #EEE;
    border-radius: 5px;
    box-shadow: 1px 1px 5px rgba(0,0,0,0.35);
    grid-gap: 5px;
    grid-template-areas:
        "title title"
        "in  out";
}
.node__title {
    grid-area: title;
    text-align: center;
    border-bottom: 1px solid black;
}

.node__var {
    margin-bottom: 2px
}

.node__vars--input {
    grid-area: in;
}

.node__vars--output {
    grid-area: out;
}

.node__remove {
    position: absolute;
    top: -20px;
    right: -20px;
    background-color: red;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
