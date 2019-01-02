import Node from './Node';

export default class ImageIdentity extends Node {
    constructor() {
        super({
            image: 'Image',
        }, {
            image: 'Image',
        });
    }

    __update() {
        this.__out.image.value = this.__in.image.value;
    }
}