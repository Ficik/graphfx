import {Inputs, Outputs} from './io';
import uuidv4 from 'uuid/v4';

export default class Node {

    constructor(name, inputDefinition, outputDefiniton, options) {
        this.name = name;
        this.id = uuidv4();
        this.__in = new Inputs(inputDefinition, this);
        this.__out = new Outputs(outputDefiniton, this);
        this.__in.update = (name) => this.__update([name]);
    }

    __update(changes) {
        throw new Error('__update method not implemented');
    }

    /**
     * Input getters
     */
    get in() {
        return this.__in;
    }

    /**
     * Output getters
     */
    get out() {
        return this.__out;
    }

    serialize() {
        return {
            id: this.id,
            name: this.name,
            options: {
                in: this.in.serialize(),
            },
        }
    }

    deserialize({id, options}) {
        this.id = id || uuidv4();
    }

    reconnect({options}, outputs) {
        console.log('outputs', outputs)
        for (let name of Object.keys(options.in)) {
            const {value, output} = options.in[name];
            if (value) {
                this.in[name].value = value;
            }
            if (output) {
                console.log('connecting', this.in[name].id, outputs[output])
                this.in[name].connect(outputs[output]);
            }
        }
    }
};

