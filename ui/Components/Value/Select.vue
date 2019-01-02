<template>
    <select v-model="value.value">
        <option
            v-for="t in type"
            :value="t"
            :key="t"
        >{{ t }}</option>
    </select>
</template>
<script>
export default {
    props: {
        type: {
            type: Array,
            required: true,
        },
        value: {
            type: null,
            required: true,
        }
    }
}
</script>
