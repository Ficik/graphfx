<template>
    <select v-model="io.value">
        <option
            v-for="value in io.definition.enum"
            :value="value"
            :key="value"
        >{{ value }}</option>
    </select>
</template>
<script>
export default {
    props: {
        type: {
            type: null,
            required: true,
        },
        io: {
            type: null,
            required: true,
        }
    }
}
</script>
