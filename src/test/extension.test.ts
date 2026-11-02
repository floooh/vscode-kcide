import { describe, test, expect } from 'vitest';

describe('Extension Test Suite', () => {
	test('Sample test', () => {
		expect([1, 2, 3].indexOf(5)).toBe(-1);
		expect([1, 2, 3].indexOf(0)).toBe(-1);
	});
});
