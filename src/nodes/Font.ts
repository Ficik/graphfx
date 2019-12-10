import Node from './Node';
import {FontVar, StringVar, NumberVar} from './io/AbstractIOSet';

const inputs = {
  fontSize: {
    type: 'Number',
    min: 1,
    default: 50,
  } as NumberVar,
  fontStyle: {
    type: 'String',
    default: 'normal',
    enum: [
        'normal',
        'bold',
        'italic',
        'bold italic',
    ]
  } as StringVar,
  font: {
    type: 'Font',
  } as FontVar,
}

const outputs = {
  fontSize: {
    type: 'Number',
  } as NumberVar,
  fontStyle: {
    type: 'String'
  } as StringVar,
  font: {
    type: 'Font',
  } as FontVar,
}

export default class Font extends Node<typeof inputs, typeof outputs> {
    constructor() {
        super('Font', inputs, outputs);
    }

    async _update() {
      this.out.font.value = this.in.font.value;
      this.out.fontStyle.value = this.in.fontStyle.value;
    }

}