import { Event_, Source } from './types';

const onEvent = (eventName: string, handlerFn: Source): Event_ => ({
  type: 'new-handler',
  payload: {
    eventName,
    handlerFn,
  },
});

const onCommand = (name: string, commandFn: Function): Event_ => ({
  type: 'new-command',
  payload: {
    name,
    commandFn,
  },
});

const emit = (eventName: string, ...args: any[]): Event_ => ({
  type: 'event-emited',
  payload: {
    eventName,
    args,
  },
});

const command = (commandName: string, ...args: any[]): Event_ => ({
  type: 'run-command',
  payload: {
    commandName,
    args,
  },
});

export { onEvent, emit, onCommand, command };
