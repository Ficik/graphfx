<template>
    <ul
        v-if="open"
        class="context-menu"
        :style="{
            '--left': `${currentPosition.x}px`,
            '--top': `${currentPosition.y}px`,
        }"
    >
        <li
            v-for="item in items"
            :key="item.label"
            class="context-menu__item"
            @click="select(item)"
        >
            {{ item.label }}
        </li>
    </ul>
</template>
<script>
export default {
    props: {
        position: {
            type: null,
            required: true,
        },
        open: {
            type: Boolean,
            default: false,
        },
        items: {
            type: Array,
            required: true,
        }
    },
    computed: {
        currentPosition() {
            return Object.assign({x: 0, y: 0}, this.position);
        },
    },
    methods: {
        select(item) {
            this.$emit('selected', {
                x: this.currentPosition.x,
                y: this.currentPosition.y,
                item,
            });
        }
    },
}
</script>
<style>
.context-menu {
    --left: 0;
    --top: 0;
    position: absolute;
    left: var(--left);
    top: var(--top);
    background-color: white;
    padding: 5px 10px;
    border-radius: 5px;
    list-style: none;
}

.context-menu__item {
    border-bottom: 1px solid
}
</style>
