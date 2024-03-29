import {Inputs, Outputs} from './io/index';
import { v4 as uuid } from 'uuid';
import {Variables, InputProperties, OutputProperties} from './io/AbstractIOSet';
import {MultiSubject} from '../helpers/listener';

/**
 * Elemetar unit of graphfx
 * has inputs/outputs which can be connected to other nodes
 */
export default class Node<I extends Variables, O extends Variables> {

    name: string
    uid: string
    id: string
    __in: Inputs<I> & InputProperties<I>
    __out: Outputs<O> & OutputProperties<O>
    __scheduledUpdate: boolean
    __currentUpdate: Promise<any>
    __running: boolean
    _stopped: boolean
    subject: MultiSubject

    constructor(name: string, inputDefinition: I, outputDefiniton: O) {
        this.name = name;
        this.uid = uuid();
        this.id = uuid();
        this.__in = new Inputs(inputDefinition, this) as Inputs<I> & InputProperties<I>;
        this.__out = new Outputs(outputDefiniton, this) as Outputs<O> & OutputProperties<O>;
        this.__in.update = (name) => this.__update([name]);
        this.__scheduledUpdate = false;
        this.__currentUpdate = Promise.resolve();
        this.__running = false;
        this._stopped = false;
        this.subject = new MultiSubject(['running']);
    }

    __update(changes) {
        if (!this.__scheduledUpdate && !this._stopped) {
            this._running = true;
            this.__scheduledUpdate = true;
            this.__currentUpdate = this.__currentUpdate
                .then(async () => {
                    const startTag =`graphfx-update-start:${this.uid}`;
                    const endTag = `graphfx-update-end:${this.uid}`
                    this.__scheduledUpdate = false;
                    if (!this.hasAllConnectedInputsValue()) {
                        return;
                    }
                    performance.mark(startTag)
                    await this._update();
                    performance.mark(endTag)
                    performance.measure(`GraphFX<${this.name}>`, startTag, endTag)
                })
                .then(() => {
                    this._running = this.__scheduledUpdate;
                })
                .catch((err) => {
                    this._running = this.__scheduledUpdate;
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
     * Node inputs
     *
     */
    get in() {
        return this.__in;
    }

    /**
     * Node outputs
     *
     */
    get out() {
        return this.__out;
    }

    hasAllConnectedInputsValue() {
        for(const inputName of Object.keys(this.in.variables)) {
            if (this.in[inputName].output && !this.in[inputName].value) {
                return false;
            }
        }
        return true;
    }

    /**
     * Create json serializable object
     */
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

    async deserialize({id, options}) {
        this.id = id || uuid();
    }

    async reconnect({options}, outputs) {
        for (let name of Object.keys(options.in)) {
            const {output} = options.in[name];
            if (output) {
                this.in[name].connect(outputs[output]);
            }
        }
        for (let name of Object.keys(options.out)) {
            await this.out[name].deserialize(options.out[name]);
        }
        for (let name of Object.keys(options.in)) {
            await this.in[name].deserialize(options.in[name]);
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

    toString() {
        return `${this.name}<${this.id}>`;
    }
};

