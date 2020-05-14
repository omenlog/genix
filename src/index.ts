import {
  Commands, Event_, Sources, Source, Handlers,
} from './types';


let handlers: Handlers = {};
const commands: Commands = {};
const sources: Sources = {};

type Output = {done?: boolean; value: Event_};

async function run(
  it: Generator<Event_>,
  payload: any = {},
): Promise<any> {
  const { done, value }: Output = it.next(payload);
  if (done) {
    return value;
  }

  let result;
  switch (value.type) {
    case 'new-command': {
      commands[value.name] = value.commandFn;
      break;
    }
    case 'sync-command': {
      result = value.args
        ? commands[value.name](...value.args)
        : commands[value.name]();
      break;
    }
    case 'async-command': {
      result = value.args
        ? await commands[value.name](...value.args)
        : await commands[value.name]();
      break;
    }
    case 'run-command': {
      const { commandName } = value;
      const command = commands[commandName];
      if (!command) {
        it.throw(new Error(`Command not register for [COMMAND: ${commandName}]`));
      } else {
        try {
          const commandResult = command(...(value.args ?? []));
          result = commandResult instanceof Promise ? await commandResult : commandResult;
        } catch (error) {
          it.throw(error);
        }
      }
      break;
    }
    case 'new-handler': {
      const { eventName, handlerFn } = value;
      if (handlers[eventName] === undefined) {
        handlers[eventName] = [handlerFn];
      } else {
        handlers[eventName].push(handlerFn);
      }
      break;
    }
    case 'event-emited': {
      const { eventName } = value;
      const eventHandlers = handlers[eventName];
      if (eventHandlers === undefined || eventHandlers.length === 0) {
        it.throw(new Error(`Handlers not defined for [EVENT:${eventName}]`));
      } else {
        eventHandlers.forEach(handler => run(handler(...(value.args ?? []))));
      }
      break;
    }
    case 'new-source': {
      const { sourceName, sourceFn } = value;
      sources[sourceName] = sourceFn;
      break;
    }
    case 'register-source': {
      const { sourceFn, args } = value;
      const sourceIt = sourceFn(...args);
      run(sourceIt);
      break;
    }
    default: {
      console.log('default');
    }
  }
  return run(it, result);
}

function exec(source: Source): void{
  const it = source();
  run(it);
}

function clearHandlers(): void{
  handlers = {};
}

function init(): void | never {
  if (handlers.INIT === undefined) {
    throw new Error('Missing INIT handler');
  } else {
    run(handlers.INIT[0]());
  }
}

const asyncCommand = (name: string, ...args: any[]): Event_ => ({
  type: 'async-command',
  name,
  args,
});

const syncCommand = (name: string, ...args: any[]): Event_ => ({
  type: 'sync-command',
  name,
  args,
});

const handler = (eventName: string, handlerFn: Source): Event_ => ({
  type: 'new-handler',
  eventName,
  handlerFn,
});

const newCommand = (name: string, commandFn: Function): Event_ => ({
  type: 'new-command',
  name,
  commandFn,
});

const emit = (eventName: string, ...args: any[]): Event_ => ({
  type: 'event-emited',
  eventName,
  args,
});

const send = (commandName: string, ...args: any[]): Event_ => ({
  type: 'run-command',
  commandName,
  args,
});

function register(source: Source, ...args: any[]): Event_ {
  return {
    sourceFn: source,
    type: 'register-source',
    args: args ?? [],
  };
}

const newSource = (sourceName: string, sourceFn: Source): Event_ => ({
  type: 'new-source',
  sourceName,
  sourceFn,
});

export {
  runSource,
  newSource,
  exec,
  init,
  send,
  emit,
  register,
};
