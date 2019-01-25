import Node from './Node';

export default class ImageIdentity extends Node {
    constructor() {
        super('ImageIdentity', {
            image: 'Image',
        }, {
            image: 'Image',
        });
    }

    _update() {
        this.__out.image.value = this.__in.image.value;
    }
}