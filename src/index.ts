export type Bus = {
  emit: (event: string, payload?: any) => void;
  handlers: Handlers;
};

type Handlers = Record<string, Function[]>;

export type Register = (source: Source) => void;

type NewCommand = {
  type: 'new-command';
  name: string;
  commandFn: Function;
};

type AsyncCommand = {
  type: 'async-command';
  name: string;
  args?: any;
};

type SyncCommand = {
  type: 'sync-command';
  name: string;
  args?: any[];
};

type Handler = {
  type: 'new-handler';
  eventName: string;
  handlerFn: Function;
};

type NewSource = {
  type: 'new-source';
  sourceName: string;
  sourceFn: Source;
};

type Source = (args?: any) => Generator<Event, void>;
type Sources = Record<string, Source>;

type RunSourceEvent = {
  type: 'run-source';
  sourceFn: Source;
  args: any[];
};

type Event =
  | Handler
  | AsyncCommand
  | SyncCommand
  | NewCommand
  | NewSource
  | RunSourceEvent;

let handlers: Handlers = {};
const commands: Record<string, Function> = {};
const sources: Sources = {};

async function run(
  it: Generator<Event, void>,
  payload: any = {},
): Promise<any> {
  const { done, value } = it.next(payload);
  if (done) {
    return value;
  }
  let result;
  if (value) {
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
      case 'new-handler': {
        const { eventName, handlerFn } = value;
        if (handlers[eventName] === undefined) {
          handlers[eventName] = [handlerFn];
        } else {
          handlers[eventName].push(handlerFn);
        }
        break;
      }
      case 'new-source': {
        const { sourceName, sourceFn } = value;
        sources[sourceName] = sourceFn;
        break;
      }
      case 'run-source': {
        const { sourceFn, args } = value;
        const sourceIt = sourceFn(...args);
        run(sourceIt);
        break;
      }
      default: {
        console.log('default');
      }
    }
  }
  return run(it, result);
}

function exec(source: Source) {
  const it = source();
  run(it);
}

function clearHandlers() {
  handlers = {};
}

function init() {
  if (handlers.INIT === undefined) {
    throw new Error('Missing INIT handler');
  } else {
    run(handlers.INIT[0]());
  }
}

const asyncCommand = (name: string, ...args: any[]) => ({
  type: 'async-command',
  name,
  args,
});

const syncCommand = (name: string, ...args: any[]) => ({
  type: 'sync-command',
  name,
  args,
});

const handler = (eventName: string, handlerFn: Function): Event => ({
  type: 'new-handler',
  eventName,
  handlerFn,
});

const newCommand = (name: string, commandFn: Function): Event => ({
  type: 'new-command',
  name,
  commandFn,
});

function runSource(source: Source | string, ...args: any[]): Event {
  const sourceFn = typeof source === 'string' ? sources[source] : source;
  return {
    sourceFn,
    type: 'run-source',
    args: args ?? [],
  };
}

const newSource = (sourceName: string, sourceFn: Source): Event => ({
  type: 'new-source',
  sourceName,
  sourceFn,
});

export {
  runSource,
  newSource,
  exec,
  init,
  syncCommand,
  clearHandlers,
  asyncCommand,
  handler,
  newCommand,
};
