import * as types from './types'


export class Inputs<T extends string> {
    constructor(variables: T[]);
    [k: string]: types.Input<any>
}

export class Outputs<T extends string> {
    constructor(variables: T[]);
    [k: string]: types.Input<any>
}