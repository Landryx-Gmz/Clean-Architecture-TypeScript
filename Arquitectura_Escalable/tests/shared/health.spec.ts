import { ping } from '../../src/shared/health.js';

describe('ping', () => {
    it('debería retornar "pong"', () => {
        expect(ping()).toBe('pong');
    });
});
