import run from './runner';
import { Source, Event_ } from './types';

function register(source: Source, ...args: any[]): Event_ {
  return {
    meta: {
      type: 'register-source',
    },
    async fn(it: Generator) {
      const sourceIt = source(...args);
      run(sourceIt);
    },
  };
}

function exec(source: Source, ...args: any[]) {
  const it = source(...args);
  return run(it);
}

export { register, exec };
