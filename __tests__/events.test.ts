import { onEvent, emit, mapEvents } from '../src';

describe('Events', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });
  test('events subscriptions can be cancelled', () => {
    const testFn = jest.fn();

    const subscription = onEvent('test-event', () => {
      testFn();
    });

    emit('test-event');
    emit('test-event');

    subscription.unsubscribe();

    emit('test-event');

    expect(testFn).toHaveBeenCalledTimes(2);
  });

  it('should allow register and emit events', () => {
    const mockFn = jest.fn();
    const subscription = onEvent('test-event', function () {
      mockFn();
    });

    emit('test-event');
    expect(mockFn).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('should allow pass arguments to event handlers', () => {
    const mockFn = jest.fn();
    const subscription = onEvent('test-event', (arg) => {
      mockFn(arg);
    });

    emit('test-event', 1);

    expect(mockFn).toHaveBeenCalledWith(1);
    subscription.unsubscribe();
  });

  test('events can have more that one handlers associated', () => {
    const mockFn = jest.fn();

    const subscription1 = onEvent('test-event', () => {
      mockFn();
    });

    const subscription2 = onEvent('test-event', () => {
      mockFn();
    });

    emit('test-event');

    expect(mockFn).toHaveBeenCalledTimes(2);

    subscription1.unsubscribe();
    subscription2.unsubscribe();
  });
  it('should allow map one event to another', () => {
    const event1Handler = jest.fn();
    const event2Handler = jest.fn();
    const arg = 10;

    const eventsMap = {
      'event-1': 'event-2',
    };

    const external = () => onEvent('event-2', event2Handler);
    const internal = () => onEvent('event-1', event1Handler);

    const event1Sub = internal();
    const event2Sub = external();

    mapEvents(eventsMap);

    emit('event-1', arg);

    expect(event1Handler).toHaveBeenCalled();
    expect(event2Handler).toHaveBeenCalledWith(arg);

    event1Sub.unsubscribe();
    event2Sub.unsubscribe();
  });
  it('should allow map one event to various events', () => {
    const event1Handler = jest.fn();
    const event2Handler = jest.fn();
    const event3Handler = jest.fn();
    const arg = 10;

    const eventsMap = {
      'event-1': ['event-2', 'event-3'],
    };

    const external2 = () => onEvent('event-2', event2Handler);
    const external3 = () => onEvent('event-3', event3Handler);
    const internal = () => onEvent('event-1', event1Handler);

    const event1Sub = internal();
    const event2Sub = external2();
    const event3Sub = external3();

    mapEvents(eventsMap);

    emit('event-1', arg);

    expect(event1Handler).toHaveBeenCalled();
    expect(event2Handler).toHaveBeenCalledWith(arg);
    expect(event3Handler).toHaveBeenCalledWith(arg);

    event1Sub.unsubscribe();
    event2Sub.unsubscribe();
    event3Sub.unsubscribe();
  });
});
