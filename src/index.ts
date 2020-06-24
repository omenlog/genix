import { command, onCommand } from './commands';
import { emit, onEvent, init } from './events';
import { register, exec, g, mapEvents } from './sources';
import testTools from './test-tools';
import initSrc from './init-src';

exec(initSrc);

export {
  exec,
  init,
  command,
  emit,
  register,
  g,
  mapEvents,
  onEvent,
  onCommand,
  testTools,
};
