export const isNil = (val) => val === null || val === undefined;

const waitForImage = (img:HTMLImageElement): Promise<HTMLImageElement> => new Promise((resolve) => img.addEventListener('load', () => resolve(img), {once: true}));

export const waitForMedia = async <T>(media:T):Promise<T> => {
    if (media instanceof Image && !media.complete) {
        await waitForImage(media);
    }
    return media;
}

export const setImmediate = <T extends (...args: any) => any>(fn:T):Promise<ReturnType<T>> => Promise.resolve().then(fn);

export const merge = (...objects) => {
    return objects.reduce((acc, nxt) => Object.assign(acc, nxt), {});
}