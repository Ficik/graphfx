import AbstractIO, { valueConstrainsSatisfied } from './AbstractIO';
import {
    Variable,
    VariableValueType,
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

    __setValue(value: VariableValueType<V>) {
        if (valueConstrainsSatisfied(this.__definition, value)) {
            if (this.__value && this.__value.release) {
                this.__value.release()
            }
            if (value && value.acquire) {
                value.acquire()
            }
            this.__value = value;
        }
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