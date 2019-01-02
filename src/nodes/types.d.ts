export interface Output<T> {
    readonly name: string
    value: T,
    connect(input: Input<T>):void
}

export interface Input<T> {
    readonly name: string
    value: T,
    connect(output: Output<T>): void
}