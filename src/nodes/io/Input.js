import AbstractIO from './AbstractIO';

export default class Input extends AbstractIO {

    constructor(name, definition, owner) {
        super(name, definition, owner);
        this.__output = null;

        this.__onchangelistener = (value) => {
            this.value = value;
            this.__notifyListeners();
        }
    }

    get value() {
        return this.__getValue();
    }

    set value(value) {
        this.__setValue(value);
        this.__owner.update(this.name);
    }

    get output() {
        return this.__output;
    }

    connect(output) {
        if (output && output.type === this.type) {
            this.disconnect();
            this.__output = output
            this.__output.onchange(this.__onchangelistener);
        }
    }

    disconnect(output) {
        if (this.__output) {
            this.__output.offchange(this.__onchangelistener);
            this.__output = null;
        }
    }

    serialize() {
        return {
            value: this.__output ? null : this.__value,
            output: this.__output ? this.__output.id: null,
        }
    }
}