import {ImageVar} from './io/AbstractIOSet';
import Node from "./Node";
import {waitForMedia} from "../utils";

const inputs = {
    image0: {
        type: 'Image'
    } as ImageVar,
    image1: {
        type: 'Image'
    } as ImageVar,
}

const outputs = {
    image0: {
        type: 'Image'
    } as ImageVar,
    image1: {
        type: 'Image'
    } as ImageVar,
}

export default class WaitForAll extends Node<typeof inputs, typeof outputs> {
    constructor(options = {}) {
        super('WaitForAll', inputs, outputs);
    }

    async _update() {
        if (!(this.in.image0.value && this.in.image1.value)) {
            return;
        }

        await Promise.all([
            waitForMedia(this.in.image0.value),
            waitForMedia(this.in.image1.value)
        ])

        this.out.image0.value = this.in.image0.value;
        this.out.image1.value = this.in.image1.value;
    }
}