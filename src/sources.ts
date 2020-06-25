import { run } from './runners';
import { Source, Event_ } from './types';
import { emit, onEvent } from './events';

function register(source: Source, ...args: any[]): Event_ {
  return {
    meta: {
      type: 'register-source',
    },
    async fn() {
      const sourceIt = source(...args);
      run(sourceIt);
    },
  };
}

function exec(source: Source, ...args: any[]) {
  const it = source(...args);
  return run(it);
}

function g(source: Source) {
  return (...args: any[]) => exec(source, ...args);
}

function mapTo(value: string) {
  return function* handler(...args: any[]) {
    yield emit(value, ...args);
  };
}

const bindEvent = g(function* (intEvent: string, extEvent: string) {
  yield onEvent(intEvent, mapTo(extEvent));
});

type EventsMap = Record<string, string | [string]>;

function* eventMapper(eventsMap: EventsMap) {
  function* mapEvent(intEvent: string) {
    const extEvent = eventsMap[intEvent];
    if (Array.isArray(extEvent)) {
      extEvent.forEach((e) => bindEvent(intEvent, e));
    } else {
      bindEvent(intEvent, extEvent);
    }
  }

  Object.keys(eventsMap).forEach(g(mapEvent));
}

const mapEvents = g(eventMapper);
export { register, exec, g, mapEvents };
