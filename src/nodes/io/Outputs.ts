import Node from '../Node';
import Output from './Output';
import {default as AbstractIOSet, Variables} from './AbstractIOSet';

export default class Outputs<V extends Variables> extends AbstractIOSet<V> {
    constructor(variables: V, owner: Node<any, any>) {
        super(variables, owner);
    }

    __createProperty(name, definition) {
        return new Output(name, definition, this);
    }

    get id() {
        return `${this.__owner.id}-out`;
    }


    serialize() {
        const res = {};
        for (let name of Object.keys(this.variables)) {
            res[name] = this.__values[name].serialize();
        }
        return res;
    }
}