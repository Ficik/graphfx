<template>
    <input
        v-model="value.value"
        :type="
            type === 'Number' ? 'number' :
            type === 'Color' ? 'color' :
            'text'
        "
    >
</template>
<script>
export default {
    props: {
        value: {
            type: null,
            required: true,
        },
        type: {
            type: String,
            required: true,
        }
    }
}
</script>
