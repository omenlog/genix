import { Handlers } from './types';

let handlers: Handlers = {};

type EventSubscription = {
  unsubscribe: () => void;
};

function onEvent(eventName: string, handlerFn: Function): EventSubscription {
  if (handlers[eventName] === undefined) {
    handlers[eventName] = new Map();
    handlers[eventName].set(handlerFn, handlerFn);
  } else {
    handlers[eventName].set(handlerFn, handlerFn);
  }

  return {
    unsubscribe: () => handlers[eventName].delete(handlerFn),
  };
}

function emitter(eventName: string, ...args: any[]) {
  const eventHandlers = handlers[eventName];
  if (eventHandlers !== undefined && eventHandlers.size !== 0)
    eventHandlers.forEach((handler) => handler(...args));
}

function fakeEmitter(eventName: string, ...args: any[]) {
  emitter('event-emitted', eventName, ...args);
  emitter(eventName, ...args);
}

const emit = process.env.NODE_ENV === 'test' ? fakeEmitter : emitter;

function wrappedEmit(eventName: string, ...args: any[]) {
  const eventHandlers = handlers[eventName];
  if (eventHandlers !== undefined && eventHandlers.size !== 0)
    eventHandlers.forEach((handler) => handler(...args));
}

type EventMapper = Record<string, string | string[]>;

function mapEvents(eventsMap: EventMapper) {
  for (const [sourceEvent, targetEvent] of Object.entries(eventsMap)) {
    if (Array.isArray(targetEvent)) {
      onEvent(sourceEvent, (...args) => {
        for (const target of targetEvent) {
          emit(target, ...args);
        }
      });
    } else {
      onEvent(sourceEvent, (...args) => emit(targetEvent, ...args));
    }
  }
}

function initEvents() {
  onEvent('genix-commands-cleared', () => {
    handlers = {};
    initEvents();
  });
}

initEvents();

export { emit, wrappedEmit, onEvent, mapEvents };
