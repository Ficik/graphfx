import StringValue from './String.vue';
import ImageValue from './Image.vue';
import SelectValue from './Select.vue';

export default {
    props: {
        type: {
            type: String,
            required: true,
        },
        value: {
            type: null,
            required: true,
        }
    },
    render(h) {
        return h(
            this.type === 'Image' ? ImageValue :
            this.type === 'Number' ? StringValue :
            Array.isArray(this.type) ? SelectValue :
            null,
        {props: {value: this.value, type: this.type}})
    }
};