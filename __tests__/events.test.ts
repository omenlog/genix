import genix, { onEvent, emit, mapEvents } from '../src';

describe('Events', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });
  test('events subscriptions can be cancelled', async () => {
    const testFn = jest.fn();

    function source() {
      const subscription = onEvent('test-event', () => {
        testFn();
      });

      emit('test-event');
      emit('test-event');

      subscription.unsubscribe();

      emit('test-event');
    }

    await genix.wrap(source).run();

    expect(testFn).toHaveBeenCalledTimes(2);
  });

  it('should allow register and emit events', async () => {
    const mockFn = jest.fn();

    function source() {
      onEvent('test-event', function () {
        mockFn();
      });

      emit('test-event');
    }

    await genix.wrap(source).run();

    expect(mockFn).toHaveBeenCalled();
  });

  it('should allow pass arguments to event handlers', async () => {
    const mockFn = jest.fn();

    function source() {
      onEvent('test-event', (arg) => {
        mockFn(arg);
      });

      emit('test-event', 1);
    }

    await genix.wrap(source).run();

    expect(mockFn).toHaveBeenCalledWith(1);
  });

  test('events can have more that one handlers associated', async () => {
    const mockFn = jest.fn();

    function source() {
      onEvent('test-event', () => {
        mockFn();
      });

      onEvent('test-event', () => {
        mockFn();
      });

      emit('test-event');
    }

    await genix.wrap(source).run();

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
  it('should allow map one event to another', async () => {
    const event1Handler = jest.fn();
    const event2Handler = jest.fn();
    const arg = 10;

    function source() {
      const eventsMap = {
        'event-1': 'event-2',
      };

      const external = () => onEvent('event-2', event2Handler);
      const internal = () => onEvent('event-1', event1Handler);

      internal();
      external();

      mapEvents(eventsMap);

      emit('event-1', arg);
    }

    await genix.wrap(source).run();

    expect(event1Handler).toHaveBeenCalled();
    expect(event2Handler).toHaveBeenCalledWith(arg);
  });
  it('should allow map one event to various events', async () => {
    const event1Handler = jest.fn();
    const event2Handler = jest.fn();
    const event3Handler = jest.fn();
    const arg = 10;

    function source() {
      const eventsMap = {
        'event-1': ['event-2', 'event-3'],
      };

      const external2 = () => onEvent('event-2', event2Handler);
      const external3 = () => onEvent('event-3', event3Handler);
      const internal = () => onEvent('event-1', event1Handler);

      internal();
      external2();
      external3();

      mapEvents(eventsMap);

      emit('event-1', arg);
    }

    await genix.wrap(source).run();

    expect(event1Handler).toHaveBeenCalled();
    expect(event2Handler).toHaveBeenCalledWith(arg);
    expect(event3Handler).toHaveBeenCalledWith(arg);
  });
});
