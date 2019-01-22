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

export const deserialize = (value) => {
    return isNil(value) ? value :
        value.type === 'image' ? deserializeImage(value) :
        value;
}