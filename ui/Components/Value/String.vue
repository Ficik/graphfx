<template>
    <input
        v-model="value"
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
        io: {
            type: null,
            required: true,
        },
        type: {
            type: String,
            required: true,
        }
    },
    computed: {
        value: {
            get() {
                return this.io.value;
            },
            set(val) {
                if (this.type === 'Number') {
                    this.io.value = parseFloat(val)
                } else {
                    this.io.value = val;
                }
            }
        }
    },
    methods: {
        onChange($event) {
            console.log('change', $event);
            this.value = $event.target.value;
        }
    }
}
</script>
