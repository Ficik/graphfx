import Output from './Output';
import AbstractIOSet from './AbstractIOSet';

export default class Outputs extends AbstractIOSet {
    constructor(variables, owner) {
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