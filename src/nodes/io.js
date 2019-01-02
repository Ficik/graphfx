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
        this.__output = output
        this.__output.onchange(this.__onchangelistener);
    }

    disconnect(output) {
        this.__output.offchage(this.__onchangelistener);
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

export class Output {

    constructor(name, owner) {
        this.__value = null;
        this.__name = name;
        this.__owner = owner
        this.__listeners = [];
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

    constructor(variables) {
        this.__values = {};
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

    update(changed) {

    }
}

export class Outputs {
    constructor(variables) {
        this.__values = {};
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
}