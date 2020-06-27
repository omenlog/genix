import { onEvent, emit, exec } from '../src';

describe('Events', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });
  it('should allow register and emit events', async () => {
    const mockFn = jest.fn();
    function* handler() {
      mockFn();
    }
    function* source() {
      yield onEvent('test-event', handler);
      yield emit('test-event');
    }

    await exec(source);
    expect(mockFn).toHaveBeenCalled();
  });

  it('should allow register events that receive args and emit them pasing some args ', async () => {
    const mockFn = jest.fn();
    function* handler(arg: any) {
      mockFn(arg);
    }
    function* source() {
      yield onEvent('test-event', handler);
      yield emit('test-event', 1);
    }

    await exec(source);
    expect(mockFn).toHaveBeenCalledWith(1);
  });

  test('can have more that one handlers associated', async () => {
    const mockFn = jest.fn();
    function* handler1() {
      mockFn();
    }
    function* handler2() {
      mockFn();
    }

    function* source() {
      yield onEvent('test-event', handler1);
      yield onEvent('test-event', handler2);
      yield emit('test-event');
    }

    await exec(source);
    expect(mockFn).toHaveBeenCalledTimes(2);
  test(
    'events subscriptions can be cancelled',
    g(function* () {
      const testFn = jest.fn();

      const subscription = yield onEvent('test-event', function* () {
        testFn();
  });

      yield emit('test-event');
      yield emit('test-event');

      subscription.unsubscribe();

      yield emit('test-event');

      expect(testFn).toHaveBeenCalledTimes(2);
    })
  );
});
