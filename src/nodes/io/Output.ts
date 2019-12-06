import AbstractIO from './AbstractIO';
import {
    Variable,
} from './AbstractIOSet';

export default class Output<V extends Variable> extends AbstractIO<V> {

    constructor(name, definition, owner) {
        super(name, definition, owner);
    }

    get id() {
        return `${this.__owner.id}-${this.__name}`;
    }

    get name() {
        return this.__name;
    }

    get value() {
        return this.__getValue();
    }

    set value(value) {
        this.__setValue(value);
        this.__notifyListeners();
    }

    __notifyListeners() {
        for (let listener of this.__listeners) {
            listener(this.value, this.name);
        }
    }

    onchange(listener) {
        this.__listeners.push(listener);
    }

    offchange(listener) {
        this.__listeners = this.__listeners
            .filter((l) => l !== listener);
    }


    serialize() {
        return {
            label: this.label,
        };
    }

    deserialize({label}) {
        this.label = label;
    }
}