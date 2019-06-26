import {isNil} from '../../utils';

const serializeImage = (image) => {
    return {type: 'image', src: image.src};
}

export const serialize = (value) => {
    return value instanceof Image ? serializeImage(value) :
        value
}


const deserializeImage = ({src}) => {
    const img = new Image();
    img.src = src;
    return img;
}

const deserializeFont = async (font) => {
    try {
        font.fontface = new FontFace(font.name, font.url);
        await font.fontface.load();
        if (!document.fonts.has(font.fontface)) {
            await document.fonts.add(font.fontface)
        }
    } catch(err) {
        console.warn('Failed to load font', err)
    }
    return font;
}

export const deserialize = async (value) => {
    return isNil(value) ? value :
        value.type === 'image' ? await deserializeImage(value) :
        value.type === 'font' ? await deserializeFont(value) :
        value;
}