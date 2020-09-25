import { isPromise } from '../src/utils';

describe('Utils', () => {
  test('isPromise should identify values that are promises', () => {
    const p1 = new Promise(function () {});

    const p2 = (async function () {})();

    const p3 = Promise.resolve();

    expect(isPromise(p1)).toBe(true);
    expect(isPromise(p2)).toBe(true);
    expect(isPromise(p3)).toBe(true);
  });
  test('isPromise should identify values that are not promises', () => {
    const a = 1;
    const b = function () {};
    function c() {}

    expect(isPromise(a)).toBe(false);
    expect(isPromise(b)).toBe(false);
    expect(isPromise(c)).toBe(false);
    expect(isPromise(undefined)).toBe(false);
  });
});
