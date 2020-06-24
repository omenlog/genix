import { g } from '../sources';
import { command } from '../commands';

const clearCommands = g(function* () {
  yield command('test.utils.clearCommands');
});

// eslint-disable-next-line import/prefer-default-export
export { clearCommands };
