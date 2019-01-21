import * as types from './types';


export class Input {

    constructor(name, owner) {
        this.__output = null;
        this.__value = null;
        this.__name = name;
        this.__owner = owner
        this.__listeners = [];
        this.__onchangelistener = (value) => {
            this.value = value;
            this.__notifyListeners();
        }
    }

    get id() {
        return `${this.__owner.id}-${this.__name}`;
    }

    get name() {
        return this.__name;
    }

    get value() {
        return this.__value;
    }

    set value(value) {
        this.__value = value;
        this.__owner.update(this.name);
    }

    connect(output) {
        this.disconnect();
        this.__output = output
        this.__output.onchange(this.__onchangelistener);
    }

    disconnect(output) {
        if (this.__output) {
            this.__output.offchange(this.__onchangelistener);
            this.__output = null;
        }
    }

    get output() {
        return this.__output;
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
            value: this.__output ? null : this.__value,
            output: this.__output ? this.__output.id: null,
        }
    }
}

export class Output {

    constructor(name, owner) {
        this.__value = null;
        this.__name = name;
        this.__owner = owner
        this.__listeners = [];
    }

    get id() {
        return `${this.__owner.id}-${this.__name}`;
    }

    get name() {
        return this.__name;
    }

    get value() {
        return this.__value;
    }

    set value(value) {
        this.__value = value;
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
}


export class Inputs {

    constructor(variables, owner) {
        this.__values = {};
        this.__owner = owner;
        this.variables = variables;

        for (let name of Object.keys(this.variables)) {
            this.__values[name] = new Input(name, this);
            Object.defineProperty(this, name, {
                get() {
                    return this.__values[name];
                },
            })
        }
    }

    get id() {
        return `${this.__owner.id}-in`;
    }

    update(changed) {

    }

    serialize() {
        const res = {};
        for (let name of Object.keys(this.variables)) {
            res[name] = this.__values[name].serialize();
        }
        return res;
    }
}

export class Outputs {
    constructor(variables, owner) {
        this.__values = {};
        this.__owner = owner;
        this.variables = variables;

        for (let name of Object.keys(this.variables)) {
            this.__values[name] = new Output(name, this);
            Object.defineProperty(this, name, {
                get() {
                    return this.__values[name];
                },
            })
        }
    }

    get id() {
        return `${this.__owner.id}-out`;
    }

    serialize() {
        return null;
    }
}