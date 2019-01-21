<template>
    <div class="app">
        <div class="app__toolbar">
            <select v-model="selectedSaveSlot">
                <option
                    v-for="save in saveSlots"
                    :key="save"
                    :value="save"
                >{{save}}</option>
            </select>
            <button @click="save">Save</button>
            <button @click="load">Load</button>
        </div>
        <Graph
            class="app__scene"
            :graph="graph"
        />
    </div>
</template>
<script>
import Graph from './Graph.vue';
import {load, save} from '../persistent';

export default {
    components: {
        Graph,
    },
    data() {
        return {
            graph: [],
            currentSelectedSaveSlot: localStorage.getItem('IFP__SELECTED_SAVE_SLOT') || 'FIRST',
            saveSlots: [
                'FIRST',
                'SECOND',
                'THIRD',
            ],
        }
    },
    computed: {
        selectedSaveSlot: {
            get() {
                return this.currentSelectedSaveSlot;
            },
            set(val) {
                this.currentSelectedSaveSlot = val;
                localStorage.setItem('IFP__SELECTED_SAVE_SLOT', val);
            }
        },

    },
    methods: {
        load() {
            this.graph = load(this.selectedSaveSlot);
        },
        save() {
            save(this.selectedSaveSlot, this.graph);
        }
    },
    mounted() {
        this.load();
    }
}
</script>
<style>
.app {
    position: fixed;
    left: 0;
    bottom: 0;
    top: 0;
    right: 0;
}

.app__toolbar {
    padding: 10px;
    text-align: right;
}
</style>
