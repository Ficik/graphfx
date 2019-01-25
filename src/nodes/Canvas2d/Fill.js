import Canvas2d from './Canvas2d';

export default class Fill extends Canvas2d {

    constructor() {
        super('Fill', {
            image: null,
            width: {
                type: 'Number',
                default: 100,
                min: 1,
            },
            height: {
                type: 'Number',
                default: 100,
                min: 1,
            },
            color: {
                type: 'Color',
                default: '#FFFFFF'
            }
        }, {});
        this._update();
    }

    async render({color, width, height}, canvas, ctx) {
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        return await createImageBitmap(canvas);
    }
}