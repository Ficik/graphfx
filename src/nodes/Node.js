import {Inputs, Outputs} from './io';
import uuidv4 from 'uuid/v4';

export default class Node {

    constructor(name, inputDefinition, outputDefiniton, options) {
        this.name = name;
        this.id = uuidv4();
        this.__in = new Inputs(inputDefinition, this);
        this.__out = new Outputs(outputDefiniton, this);
        this.__in.update = (name) => this.__update([name]);
        this.__scheduledUpdate = false;
    }

    __update(changes) {
        if (!this.__scheduledUpdate) {
            this.__scheduledUpdate = true;
            Promise.resolve()
                .then(() => {
                    this.__scheduledUpdate = false;
                    this._update();
                });
        }
    }

    _update(){
        throw new Error('_update method not implemented');
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
                out: this.out.serialize(),
            },
        }
    }

    deserialize({id, options}) {
        this.id = id || uuidv4();
    }

    reconnect({options}, outputs) {
        console.log('outputs', outputs)
        for (let name of Object.keys(options.in)) {
            const {output} = options.in[name];
            if (output) {
                console.log('connecting', this.in[name].id, outputs[output])
                this.in[name].connect(outputs[output]);
            }
        }
        for (let name of Object.keys(options.out)) {
            this.out[name].deserialize(options.out[name]);
        }
        for (let name of Object.keys(options.in)) {
            console.log(options.in[name]);
            this.in[name].deserialize(options.in[name]);
        }
    }
};

