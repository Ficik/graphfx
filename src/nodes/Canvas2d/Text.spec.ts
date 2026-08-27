import {describe, expect, it} from 'vitest';
import Text from './Text';
import {PoolCanvas} from '../../canvas/CanvasPool';
import {alphaBounds, imageData} from '../../../tests/helpers/image';
import {nextOutput} from '../../../tests/helpers/node';

const render = async (textAlign: 'left' | 'center' | 'right') => {
    const text = new Text();
    const output = nextOutput<PoolCanvas<OffscreenCanvas>>(
        text.out.image,
        (value) => Boolean(value && value.width === 160 && value.height === 60),
    );

    text.in.width.value = 160;
    text.in.height.value = 60;
    text.in.text.value = 'GraphFX\\nCanvas2D';
    text.in.font.value = 'Arial';
    text.in.fontSize.value = 20;
    text.in.fontStyle.value = 'bold';
    text.in.color.value = '#326496';
    text.in.textAlign.value = textAlign;

    return {text, result: await output};
};

const occupiedRowGroups = (image: OffscreenCanvas) => {
    const {data, width, height} = imageData(image);
    const rows: number[] = [];
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            if (data[(y * width + x) * 4 + 3] > 0) {
                rows.push(y);
                break;
            }
        }
    }

    return rows.reduce<number[][]>((groups, row) => {
        const current = groups[groups.length - 1];
        if (!current || current[current.length - 1] !== row - 1) {
            groups.push([row]);
        } else {
            current.push(row);
        }
        return groups;
    }, []);
};

describe('Text', () => {
    it('renders escaped newlines as separate colored lines', async () => {
        const {text, result} = await render('center');
        const bounds = alphaBounds(result);

        expect(result).toBeInstanceOf(OffscreenCanvas);
        expect(text.out.width.value).toBe(160);
        expect(text.out.height.value).toBe(60);
        expect(bounds).not.toBeNull();
        expect(occupiedRowGroups(result)).toHaveLength(2);

        const pixels = imageData(result).data;
        const opaquePixel = Array.from({length: pixels.length / 4}, (_, index) => index)
            .find((index) => pixels[index * 4 + 3] === 255);
        expect(Array.from(pixels.slice(opaquePixel * 4, opaquePixel * 4 + 3))).toEqual([
            50,
            100,
            150,
        ]);

        result.release();
        text.destroy();
    });

    it('positions the same text for left, center, and right alignment', async () => {
        const rendered = [];
        for (const alignment of ['left', 'center', 'right'] as const) {
            rendered.push(await render(alignment));
        }

        const [left, center, right] = rendered.map(({result}) => alphaBounds(result));
        expect(left.width).toBe(center.width);
        expect(center.width).toBe(right.width);
        expect(center.left - left.left).toBeGreaterThan(20);
        expect(right.left - center.left).toBeGreaterThan(20);

        for (const {text, result} of rendered) {
            result.release();
            text.destroy();
        }
    });
});
