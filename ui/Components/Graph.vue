<template>
    <div>
        <Node
            v-for="(node, index) in graph"
            :key="index"
            :node="node"
        />
    </div>
</template>
<script>
import Node from './Node.vue';

export default {
    components: {
        Node,
    },
    props: {
        graph: {
            type: Array,
            required: true,
        }
    }
}
</script>
