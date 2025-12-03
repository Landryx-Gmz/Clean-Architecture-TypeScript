import { ping } from '../../src/shared/health';

describe('ping', () => {
    it('debería retornar "pong"', () => {
        expect(ping()).toBe('pong');
    });
});
