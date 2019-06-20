import Node from './Node';

export default class Font extends Node {
    constructor() {
        super('Font', {
          fontSize: {
            type: 'Number',
            min: 1,
            default: 50,
          },
          fontStyle: {
            type: 'String',
            default: 'normal',
            enum: [
                'normal',
                'bold',
                'italic',
                'bold italic',
            ]
          },
          font: {
            type: 'Font',
          },
        }, {
          fontSize: {
            type: 'Number',
          },
          fontStyle: {
            type: 'String'
          },
          font: {
            type: 'Font',
          },
        }, {});
    }

    async _update() {
      this.out.font.value = this.in.font.value;
      this.out.fontStyle.value = this.in.fontStyle.value;
    }

}