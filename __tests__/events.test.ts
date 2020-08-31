import { onEvent, emit, g } from '../src';

describe('Events', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });
  it(
    'should allow register and emit events',
    g(function* () {
      const mockFn = jest.fn();

      const subscription = yield onEvent('test-event', function* () {
        mockFn();
      });

      yield emit('test-event');

      expect(mockFn).toHaveBeenCalled();
      subscription.unsubscribe();
    })
  );

  it(
    'should allow register events that receive args and emit them passing some args ',
    g(function* () {
      const mockFn = jest.fn();

      const subscription = yield onEvent('test-event', function* (arg) {
        mockFn(arg);
      });

      yield emit('test-event', 1);

      expect(mockFn).toHaveBeenCalledWith(1);
      subscription.unsubscribe();
    })
  );

  test(
    'can have more that one handlers associated',
    g(function* () {
      const mockFn = jest.fn();

      const subscription1 = yield onEvent('test-event', function* () {
        mockFn();
      });

      const subscription2 = yield onEvent('test-event', function* () {
        mockFn();
      });

      yield emit('test-event');

      expect(mockFn).toHaveBeenCalledTimes(2);

      subscription1.unsubscribe();
      subscription2.unsubscribe();
    })
  );

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

  test(
    'events can have functions as handlers',
    g(function* () {
      const testFn = jest.fn();
      yield onEvent('test-event', testFn);
      yield emit('test-event');

      expect(testFn).toHaveBeenCalled();
    })
  );
});
