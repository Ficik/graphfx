import Outputs from './Outputs';

describe('Outputs', () => {
    it('should create with default values', () => {
        const owner = {
            id: 'owner',
        };

        const inputs = new Outputs({
            x: {
                type: 'Number',
                min: 0,
                max: 1,
                default: 0,
            },
            y: {
                type: 'Number',
                default: 1
            },
            foo: {
                type: 'String',
                default: 'foo'
            },
        }, owner)

        expect(inputs.x.type).toBe('Number');
        expect(inputs.x.value).toBe(0);
        expect(inputs.y.value).toBe(1);
    });
});