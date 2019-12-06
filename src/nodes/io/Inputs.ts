import Input from './Input';
import Node from '../Node';
import {default as AbstractIOSet, Variables} from './AbstractIOSet';

export default class Inputs<V extends Variables> extends AbstractIOSet<V> {

    constructor(variables: V, owner: Node<any, any>) {
        super(variables, owner);
    }

    __createProperty(name, definition) {
        return new Input(name, definition, this);
    }

    get id() {
        return `${this.__owner.id}-in`;
    }

    serialize() {
        const res = {};
        for (let name of Object.keys(this.variables)) {
            res[name] = this.__values[name].serialize();
        }
        return res;
    }
}