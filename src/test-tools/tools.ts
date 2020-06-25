import { g } from '../sources';
import { command, onCommand } from '../commands';
import { Source } from '../types';
import { testRun } from '../runners';

const clearCommands = g(function* () {
  yield command('test.utils.clearCommands');
});

async function exec(source: Source, mockCommands: any) {
  Object.keys(mockCommands).forEach(
    g(function* (key: string) {
      yield onCommand(key, mockCommands[key]);
    })
  );

  const it = source();
  const { result, events } = await testRun(it, {}, {});
  return { result, events };
}

// eslint-disable-next-line import/prefer-default-export
export { clearCommands, exec };
