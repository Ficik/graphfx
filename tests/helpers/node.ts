type ObservableOutput<T> = {
    onchange(listener: (value: T) => void): void,
    offchange(listener: (value: T) => void): void,
};

export const nextOutput = <T>(
    output: ObservableOutput<T>,
    predicate: (value: T) => boolean = (value) => Boolean(value),
): Promise<T> => new Promise((resolve) => {
    const listener = (value: T) => {
        if (predicate(value)) {
            output.offchange(listener);
            resolve(value);
        }
    };
    output.onchange(listener);
});
