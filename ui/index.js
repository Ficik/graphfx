import Vue from 'vue';
import Graph from './Components/Graph.vue';

import graph from './graph';

new Vue({
    el: '#app',
    render(h) {
        return h(Graph, {props: {graph}})
    }
})