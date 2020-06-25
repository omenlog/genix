import { Handlers, Source, Event_ } from './types';
import { run } from './runners';

const handlers: Handlers = {};

function onEvent(eventName: string, handlerFn: Source): Event_ {
  return {
    meta: {
      type: 'new-handler',
    },
    async fn() {
      if (handlers[eventName] === undefined) {
        handlers[eventName] = [handlerFn];
      } else {
        handlers[eventName].push(handlerFn);
      }
    },
  };
}

function emit(eventName: string, ...args: any[]): Event_ {
  return {
    meta: {
      args,
      type: 'event-emited',
      name: eventName,
    },
    async fn(it: Generator) {
      const eventHandlers = handlers[eventName];
      if (eventHandlers === undefined || eventHandlers.length === 0) {
        it.throw(new Error(`Handlers not defined for [EVENT:${eventName}]`));
      } else {
        eventHandlers.forEach((handler) => run(handler(...args)));
      }
    },
  };
}

function init(): void | never {
  if (handlers.init === undefined) {
    throw new Error('Missing INIT handler');
  } else {
    run(handlers.init[0]());
  }
}

export { onEvent, emit, init };
