import {
  Commands, Event_, Source, Handlers,
} from './types';


const handlers: Handlers = {};
const commands: Commands = {};

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
    case 'run-command': {
      const { commandName } = value;
      const command = commands[commandName];
      if (!command) {
        it.throw(new Error(`Command not registered for [COMMAND: ${commandName}]`));
      } else {
        try {
          const commandResult = command(...value.args);
          // console.log(commandResult instanceof Promise);
          result = commandResult instanceof Promise ? await commandResult : commandResult;
        } catch (error) {
          it.throw(error);
        }
      }
      break;
    }
    case 'new-command': {
      const commandName = value.name;
      if (commands[commandName] !== undefined) {
        it.throw(new Error('Not allowed more that one handler per command'));
      } else {
        commands[commandName] = value.commandFn;
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
        eventHandlers.forEach(handler => run(handler(...value.args)));
      }
      break;
    }
    case 'register-source': {
      const { sourceFn, args } = value;
      const sourceIt = sourceFn(...args);
      run(sourceIt);
      break;
    }
    default: {
      it.throw(new Error('Invalid Operation'));
    }
  }
  return run(it, result);
}

function exec(source: Source, ...args: any[]) {
  const it = source(...args);
  return run(it);
}

function init(): void | never {
  if (handlers.init === undefined) {
    throw new Error('Missing INIT handler');
  } else {
    run(handlers.init[0]());
  }
}

const onEvent = (eventName: string, handlerFn: Source): Event_ => ({
  type: 'new-handler',
  eventName,
  handlerFn,
});

const onCommand = (name: string, commandFn: Function): Event_ => ({
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
    args,
  };
}

export {
  exec,
  init,
  send,
  emit,
  register,
  onEvent,
  onCommand,
};
