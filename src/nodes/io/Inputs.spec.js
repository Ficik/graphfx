import Inputs from './Inputs';

describe('Inputs', () => {
    it('should create with default values', () => {
        const owner = {
            id: 'owner',
            update(name) {

            }
        };

        const inputs = new Inputs({
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

        inputs.x.value = 1;
        expect(inputs.x.value).toBe(1);
    });
});