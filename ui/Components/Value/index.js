import StringValue from './String.vue';
import ImageValue from './Image.vue';
import SelectValue from './Select.vue';

export default {
    props: {
        io: {
            type: Object,
            required: true,
        },
        direction: {
            type: String,
            required: true,
        },
    },
    render(h) {
        return h(
            this.io.definition.enum ? SelectValue :
            this.io.type === 'Image' ? ImageValue :
            this.io.type === 'String' ? StringValue :
            this.io.type === 'Number' ? StringValue :
            this.io.type === 'Color' ? StringValue :
            null,
        {
            props: {
                io: this.io,
                value: this.io.value,
                type: this.io.type,
                direction: this.direction
            },
            on: {
                change: (value) => {
                    this.$emit('change', value);
                }
            }
        })
    }
};