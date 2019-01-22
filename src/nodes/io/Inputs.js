import Input from './Input';
import AbstractIOSet from './AbstractIOSet';

export default class Inputs extends AbstractIOSet {

    constructor(variables, owner) {
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