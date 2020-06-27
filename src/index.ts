import { command, onCommand } from './commands';
import { emit, onEvent } from './events';
import { register, exec, g, mapEvents } from './sources';
import testTools from './test-tools';
import initSrc from './init-src';

exec(initSrc);

export {
  exec,
  command,
  emit,
  register,
  g,
  mapEvents,
  onEvent,
  onCommand,
  testTools,
};
