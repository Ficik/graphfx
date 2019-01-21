<template>
    <div
        class="node"
    >
        <div style="flex: 1" class="node__vars node__vars--input">
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
                    :type="type"
                    :value="node.in[name]"
                    class="node-var__value"
                />
            </div>
        </div>
        <div style="flex: 1">
            <div>
                {{node.name}}
            </div>
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
                    :type="type"
                    :value="node.out[name]"
                    class="node-var__value"
                />
            </div>
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
    display: inline-flex;
    flex-direction: row;
    background-color: #EEE;
    border-radius: 5px;
    box-shadow: 1px 1px 5px rgba(0,0,0,0.35);
}

.node__var {
    margin-bottom: 2px
}
</style>
