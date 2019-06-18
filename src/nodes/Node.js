import {Inputs, Outputs} from './io';
import uuidv4 from 'uuid/v4';
import {MultiSubject} from '../helpers/listener';

export default class Node {

    constructor(name, inputDefinition, outputDefiniton, options) {
        this.name = name;
        this.uid = uuidv4();
        this.id = uuidv4();
        this.__in = new Inputs(inputDefinition, this);
        this.__out = new Outputs(outputDefiniton, this);
        this.__in.update = (name) => this.__update([name]);
        this.__scheduledUpdate = false;
        this.__currentUpdate = Promise.resolve();
        this.__running = false;
        this._stopped = false;
        this.subject = new MultiSubject(['running']);
    }

    __update(changes) {
        if (!this.__scheduledUpdate && !this._stopped) {
            this.__scheduledUpdate = true;
            this.__currentUpdate = this.__currentUpdate
                .then(() => {
                    this._running = true;
                })
                .then(async () => {
                    const startTag =`graphfx-update-start:${this.uid}`;
                    const endTag = `graphfx-update-end:${this.uid}`
                    this.__scheduledUpdate = false;
                    performance.mark(startTag)
                    await this._update();
                    performance.mark(endTag)
                    performance.measure(`GraphFX<${this.name}>`, startTag, endTag)
                })
                .then(() => {
                    this._running = false;
                })
                .catch((err) => {
                    this._running = false;
                    throw err;
                });
        }
    }

    _update(){
        throw new Error('_update method not implemented');
    }

    get _running() {
        return this.__running;
    }

    set _running(val) {
        if (this.__running !== val) {
            this.__running = val;
            this.subject.next('running', this.__running);
        }
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
        for (let name of Object.keys(options.in)) {
            const {output} = options.in[name];
            if (output) {
                this.in[name].connect(outputs[output]);
            }
        }
        for (let name of Object.keys(options.out)) {
            this.out[name].deserialize(options.out[name]);
        }
        for (let name of Object.keys(options.in)) {
            this.in[name].deserialize(options.in[name]);
        }
    }

    destroy() {
        this._stopped = true;
        Promise.resolve()
            .then(() => {
                for (let input of this.in) {
                    input.disconnect();
                }
            })
    }
};

