import {expect} from 'vitest';

const fixtureUrls = import.meta.glob('../fixtures/**/*.png', {
    eager: true,
    import: 'default',
    query: '?url',
}) as Record<string, string>;

export const fixtureUrl = (path: string) => {
    const url = fixtureUrls[`../fixtures/${path}`];
    if (!url) {
        throw new Error(`Image fixture not found: ${path}`);
    }
    return url;
};

export const loadFixture = async (path: string): Promise<HTMLImageElement> => {
    const image = new Image();
    image.src = fixtureUrl(path);
    await image.decode();
    return image;
};

export const imageData = (
    image: CanvasImageSource & {width: number, height: number},
) => {
    const canvas = new OffscreenCanvas(image.width, image.height);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, image.width, image.height);
};

export const expectPixelsToMatch = (
    actual: CanvasImageSource & {width: number, height: number},
    expected: CanvasImageSource & {width: number, height: number},
    maximumChannelDifference = 0,
) => {
    expect(actual.width).toBe(expected.width);
    expect(actual.height).toBe(expected.height);

    const actualPixels = imageData(actual).data;
    const expectedPixels = imageData(expected).data;
    let differentChannels = 0;
    let largestDifference = 0;

    for (let index = 0; index < actualPixels.length; index += 1) {
        const difference = Math.abs(actualPixels[index] - expectedPixels[index]);
        if (difference > 0) {
            differentChannels += 1;
            largestDifference = Math.max(largestDifference, difference);
        }
    }

    expect(largestDifference).toBeLessThanOrEqual(maximumChannelDifference);
    if (maximumChannelDifference === 0) {
        expect(differentChannels).toBe(0);
    }
};

export const alphaBounds = (
    image: CanvasImageSource & {width: number, height: number},
) => {
    const {data, width, height} = imageData(image);
    let left = width;
    let right = -1;
    let top = height;
    let bottom = -1;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            if (data[(y * width + x) * 4 + 3] > 0) {
                left = Math.min(left, x);
                right = Math.max(right, x);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
            }
        }
    }

    return right < left ? null : {
        left,
        right,
        top,
        bottom,
        width: right - left + 1,
        height: bottom - top + 1,
    };
};
