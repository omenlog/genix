import {
  emit,
  onEvent,
  command,
  onCommand,
  exec,
  init,
  register,
  g,
  mapEvents,
  testTools,
} from '../src';
import { Source } from '../src/types';

type Options = { initHandler: Function };

function setup(options: Options) {
  function* initHandler() {
    options.initHandler();
  }

  function* testSource(initH: Source) {
    yield onEvent('init', initH);
  }

  exec(testSource, initHandler);
}

describe('Core lib tests', () => {
  beforeEach(async () => {
    expect.hasAssertions();
  });

  describe('Init process', () => {
    it('should throw an exception if not init handler is provide at the exec moment', () => {
      expect(() => init()).toThrow();
    });

    it('should export a function for emit init event as entry point', () => {
      const initHandler = jest.fn();

      setup({ initHandler });
      init();

      expect(initHandler).toHaveBeenCalled();
    });
  });
});
