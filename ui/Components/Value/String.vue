<template>
    <input v-model="value.value">
</template>
<script>
export default {
    props: {
        value: {
            type: null,
            required: true,
        }
    }
}
</script>
