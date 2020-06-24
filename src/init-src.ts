import { register } from './sources';
import { commandsSrc } from './commands';

function* initSrc() {
  yield register(commandsSrc);
}

export default initSrc;
