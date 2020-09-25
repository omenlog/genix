import { onEvent, wrappedEmit } from '../events';
import { exec as execCommand } from '../commands';
import { isPromise } from '../utils';
import { WrapperResult } from '../types';

type Wrapper = {
  emit(eventName: string, args?: any): Wrapper;
  exec(commandName: string, args?: any): Wrapper;
  run(): Promise<WrapperResult>;
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

function wrap(fn: Function): Wrapper {
  const operations = [];
  operations.push(() => fn());
  return {
    emit(name, ...args) {
      operations.push(() => wrappedEmit(name, ...args));
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
