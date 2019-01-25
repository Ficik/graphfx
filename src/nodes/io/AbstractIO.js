import {isNil} from '../../utils';

export const defaultConstrainSatisfied = (value) => {
    return !isNil(value);
}

export const imageConstrainSatisfied = (value) => {
    return value instanceof HTMLCanvasElement ||
        value instanceof Image ||
        value instanceof HTMLVideoElement ||
        value instanceof ImageData ||
        value instanceof ImageBitmap;
};

export const colorConstrainSatisfied = (value) => {
    return /#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/.test(value);
};

export const numberConstrainsSatisfied = (definition, value) => {
    return typeof(value) === 'number' && !isNaN(value) &&
        (isNil(definition.min) || (value >= definition.min)) &&
        (isNil(definition.max) || (value <= definition.max))
}

export const valueConstrainsSatisfied = (definition, value) => {
    return defaultConstrainSatisfied(value) && (
        definition.type === 'Number' ? numberConstrainsSatisfied(definition, value) :
        definition.type === 'Color' ? colorConstrainSatisfied(value) :
        definition.type === 'Image' ? imageConstrainSatisfied(value) :
        true
    )
};

export default class AbstractIO {

    constructor(name, definition, owner) {
        this.__name = name;
        this.__owner = owner
        this.__definition = definition;
        this.__value = null;
        this.label = null;
        this.__listeners = [];
    }

    get definition() {
        return this.__definition;
    }

    get __defaultValue() {
        return this.__definition.default;
    }

    get id() {
        return `${this.__owner.id}-${this.__name}`;
    }

    get name() {
        return this.__name;
    }

    get type() {
        return this.__definition.type;
    }

    get value() {
        return this.__getValue;
    }

    set value(val) {
        this.__setValue(val);
    }

    __getValue() {
        return (valueConstrainsSatisfied(this.__definition, this.__value)) ? this.__value : this.__defaultValue;
    }

    __setValue(value) {
        if (valueConstrainsSatisfied(this.__definition, value)) {
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

}