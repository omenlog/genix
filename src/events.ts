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
        handlers[eventName] = new Map();
        handlers[eventName].set(handlerFn, handlerFn);
      } else {
        handlers[eventName].set(handlerFn, handlerFn);
      }
      return { unsubscribe: () => handlers[eventName].delete(handlerFn) };
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
    async fn() {
      const eventHandlers = handlers[eventName];
      if (eventHandlers !== undefined && eventHandlers.size !== 0)
        eventHandlers.forEach((handler) => run(handler(...args)));
    },
  };
}

export { onEvent, emit };
