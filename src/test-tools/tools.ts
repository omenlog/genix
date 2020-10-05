import { onEvent, wrappedEmit } from '../events';
import { exec as execCommand, onCommand } from '../commands';
import { isPromise } from '../utils';

export type WrapperResult = {
  data: any;
  events: Record<string, any[]>;
};

type Wrapper = {
  emit(eventName: string, args?: any): Wrapper;
  onCommand(commandName: string, handler: Function): Wrapper;
  exec(commandName: string, args?: any): Wrapper;
  run(): Promise<WrapperResult>;
};

type Config = {
  commands: Record<string, Function>;
};

let tasks = Promise.resolve();

function execWrapper(fn: Function): Promise<WrapperResult> {
  return new Promise((resolve, reject) => {
    tasks = tasks
      .then(() => {
        return fn();
      })
      .then(resolve)
      .catch(reject);
  });
}

function wrap(fn: Function, config?: Config): Wrapper {
  const operations = [];
  operations.push(() => fn());

  if (config) {
    for (const [command, handler] of Object.entries(config.commands)) {
      onCommand(command, handler);
    }
  }

  return {
    emit(name, ...args) {
      operations.push(() => wrappedEmit(name, ...args));
      return this;
    },
    onCommand(commandName, handler) {
      onCommand(commandName, handler);
      return this;
    },
    exec(name, ...args) {
      operations.push(() => execCommand(name, ...args));
      return this;
    },
    async run() {
      const res = execWrapper(async () => {
        const events = {};

        onEvent('event-emitted', (eventName, ...args) => {
          if (!events[eventName]) {
            events[eventName] = [];
          }

          events[eventName].push(...args);
        });

        const op = operations.reduce((prevOp, nextOp) => {
          if (isPromise(prevOp)) {
            return prevOp.then(() => nextOp());
          }

          return nextOp();
        }, undefined);

        let r;
        if (isPromise(op)) {
          r = await op;
        } else {
          r = op;
        }

        execCommand('genix-clear-commands');

        return { data: r, events };
      });

      return res;
    },
  };
}

// eslint-disable-next-line import/prefer-default-export
export { wrap };
