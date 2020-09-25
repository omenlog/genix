import { exec, onCommand } from './commands';
import { emit, onEvent, mapEvents } from './events';
import { wrap } from './test-tools';

const genix = {
  wrap,
};

export default genix;
export { exec, emit, mapEvents, onEvent, onCommand };
