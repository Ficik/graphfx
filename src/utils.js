export const isNil = (val) => val === null || val === undefined;

const waitForImage = (img) => new Promise((resolve) => img.addEventListener('load', resolve, {once: true}));

export const waitForMedia = async (media) => {
    if (media instanceof Image && !media.complete) {
        await waitForImage(media);
    }
    return media;
}

export const setImmediate = (fn) => Promise.resolve().then(fn);