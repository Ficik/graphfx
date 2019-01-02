<template>
    <div
        style="
            border: 2px solid black;
            margin: 5px;
            padding: 2px;
            display: flex;
            flex-direction: row;
        "
    >
        <div style="flex: 1">
            <strong>Inputs:</strong>
            <div v-for="(type, name) in node.in.variables" :key="name">
                <div>{{ name }} <i>{{typeName(type)}}</i></div>
                <Value :type="type" :value="node.in[name]" />
            </div>
        </div>
        <div style="flex: 1">
            <strong>Outputs:</strong>
            <div v-for="(type, name) in node.out.variables" :key="name">
                <div>{{ name }} <i>{{typeName(type)}}</i></div>
                <Value :type="type" :value="node.out[name]" />
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
        node: {
            type: Object,
            required: true,
        }
    },
    methods: {
        typeName(type) {
            return Array.isArray(type) ? 'Option' : type;
        }
    }
}
</script>
