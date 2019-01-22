

export default class AbstractIOSet {

    constructor(variables, owner) {
        this.__values = {};
        this.__owner = owner;
        this.variables = variables;

        for (let name of Object.keys(this.variables)) {
            if (variables[name] === null) {
                delete this.variables[name];
                continue;
            }
            this.__values[name] = this.__createProperty(name, variables[name]);
            Object.defineProperty(this, name, {
                get() {
                    return this.__values[name];
                },
            })
        }
    }

    __createProperty(name, definition) {

    }


    update(changed) {

    }
}
