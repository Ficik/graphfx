import Node from '../Node';
import Input from './Input';
import Output from './Output';
import AbstractIO from './AbstractIO';

type ImageType = HTMLCanvasElement
    | OffscreenCanvas
    | HTMLImageElement
    | HTMLVideoElement
    | ImageData
    | ImageBitmap;

export interface NumberVar {
    type: 'Number',
    min?: number
    max?: number
    step?: number
    default?: VariableValueType<NumberVar>
}

export interface StringVar {
    type: 'String',
    default?: VariableValueType<StringVar>
    enum?: string[]
}

export interface BooleanVar {
    type: 'Boolean',
    default?: VariableValueType<BooleanVar>
}

export interface ColorVar {
    type: 'Color',
    default?: VariableValueType<ColorVar>
}

export interface FontVar {
    type: 'Font',
    default?: VariableValueType<FontVar>
}

export interface ImageVar {
    type: 'Image'
    default?: VariableValueType<ImageVar>
}

export type Variable = NumberVar
    | StringVar
    | BooleanVar
    | ColorVar
    | FontVar
    | ImageVar

export interface Variables {
    [key: string]: Variable
}

export type VariablesType<V extends Variables> = {
    [K in keyof V]: V[K] extends Variable ? V[K] : never
};

export type VariableValueType<T> = T extends NumberVar ? number :
    T extends BooleanVar ? boolean :
    T extends ImageVar ? ImageType :
    string

export type IOProperties<V extends Variables> = {
    [K in keyof V]: AbstractIO<V[K]>
}

export type InputProperties<V extends Variables> = {
    [K in keyof V]: Input<V[K]>
}

export type OutputProperties<V extends Variables> = {
    [K in keyof V]: Output<V[K]>
}

export default class AbstractIOSet<V extends Variables> {

    __values: any
    __owner: Node<any, any>
    variables: V

    constructor(variables: V, owner: Node<any, any>) {
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

    get id() {
        return `${this.__owner.id}-set`;
    }

    *[Symbol.iterator]() {
        for (let name of Object.keys(this.variables)) {
            yield this.__values[name];
        }
    }

    __createProperty(name, definition) {

    }


    update(changed) {

    }
}
