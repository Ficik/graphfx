import {Inputs, Outputs} from './io.js';

export default class Node {

    constructor(inputNames, outputNames) {
        this.__in = new Inputs(inputNames);
        this.__out = new Outputs(outputNames);
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
};

