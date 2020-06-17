import {
  emit,
  onEvent,
  command,
  onCommand,
  exec,
  init,
  register,
} from '../src';
import { Source } from '../src/types';
import { g } from '../src/sources';

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
  beforeEach(() => {
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

  describe('Sources', () => {
    it('should allow execute sources', () => {
      const testFn = jest.fn();
      function* testSrc() {
        testFn();
      }

      exec(testSrc);
      expect(testFn).toHaveBeenCalled();
    });

    it('should allow execute sources passing some values as arguments ', () => {
      const testFn = jest.fn();
      function* testSrc(arg: number) {
        testFn(arg);
      }

      exec(testSrc, 1);
      expect(testFn).toHaveBeenCalledWith(1);
    });

    it('should allow  register new sources from sources', () => {
      const testFn = jest.fn();

      function* newSrc() {
        testFn();
      }

      function* testSrc() {
        yield register(newSrc);
      }

      exec(testSrc);
      expect(testFn).toHaveBeenCalled();
    });

    it('should export a function that make easier integration with cb handlers', (done) => {
      const testFn = jest.fn();
      function* handler() {
        testFn();
      }

      function* source() {
        yield onEvent('async-event', handler);
      }

      function* timeOutHandler() {
        yield emit('async-event');
        expect(testFn).toHaveBeenCalled();
        done();
      }

      exec(source);
      setTimeout(g(timeOutHandler), 0);
    });

    test('g function allow pass arguments to inner source', () => {
      const testFn = jest.fn();
      function* testSrc(name: string) {
        testFn(name);
      }

      const handler = g(testSrc);
      handler('omar');
      expect(testFn).toHaveBeenCalledWith('omar');
    });

    test('g function allow get sources return values', async () => {
      function* src() {
        return 10;
      }

      const handler = g(src);
      const result = await handler();
      expect(result).toBe(10);
    });

    it('should throw and error is the user try to execute and invalid operation', () => {
      function* source() {
        yield {
          type: 'invalid operation',
          eventName: 'invalid',
          handlerFn: () => {},
        };
      }

      expect(exec(source as any)).rejects.toThrow();
    });
  });

  describe('Events', () => {
    it('should allow register and emit events', async () => {
      const mockFn = jest.fn();
      function* handler() {
        mockFn();
      }
      function* source() {
        yield onEvent('test-event', handler);
        yield emit('test-event');
      }

      await exec(source);
      expect(mockFn).toHaveBeenCalled();
    });

    it('should allow register events that receive args and emit them pasing some args ', async () => {
      const mockFn = jest.fn();
      function* handler(arg: any) {
        mockFn(arg);
      }
      function* source() {
        yield onEvent('test-event', handler);
        yield emit('test-event', 1);
      }

      await exec(source);
      expect(mockFn).toHaveBeenCalledWith(1);
    });

    test('can have more that one handlers associated', async () => {
      const mockFn = jest.fn();
      function* handler1() {
        mockFn();
      }
      function* handler2() {
        mockFn();
      }

      function* source() {
        yield onEvent('test-event', handler1);
        yield onEvent('test-event', handler2);
        yield emit('test-event');
      }

      await exec(source);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if the user try to sent and event without handler associated', () => {
      function* source() {
        yield emit('unexisting-event');
      }

      expect(exec(source)).rejects.toThrow();
    });
  });

  describe('Commands', () => {
    test('sync commands can be registered and executed', async () => {
      const commandFn = jest.fn();

      function* source() {
        yield onCommand('test-command-1', commandFn);
        yield command('test-command-1');
      }

      await exec(source);

      expect(commandFn).toHaveBeenCalled();
    });

    test('sync commands can accept arguments and return a value', async () => {
      const commandFn = (value: number) => value + 1;
      function* source() {
        yield onCommand('test-command-2', commandFn);
        const newValue = yield command('test-command-2', 1);
        expect(newValue).toBe(2);
      }

      await exec(source);
    });

    test('async commands can be executed', async () => {
      const commandFn = jest.fn().mockImplementation(() => Promise.resolve(1));

      function* source() {
        yield onCommand('test-async-command-1', commandFn);
        yield command('test-async-command-1');
      }

      await exec(source);
      expect(commandFn).toHaveBeenCalled();
    });

    test('async commands can accept arguments and return a value', async () => {
      const commandFn = jest
        .fn()
        .mockImplementation((arg) => Promise.resolve(arg));

      function* source() {
        yield onCommand('test-async-command-2', commandFn);
        yield command('test-async-command-2', 10);
      }

      await exec(source);
      expect(commandFn).toHaveBeenCalledWith(10);
    });

    it('should throw and error if we try to assing more that one handler per command', () => {
      function* source() {
        yield onCommand('t-command', setTimeout);
        yield onCommand('t-command', setTimeout);
      }

      expect(exec(source)).rejects.toThrow();
    });

    it('should throw and error if we try to execute a not registered command', () => {
      function* source() {
        yield command('no-registered-command', setTimeout);
      }

      expect(exec(source)).rejects.toThrow();
    });

    it('should throw error if command execution fails', () => {
      const commandFn = jest.fn().mockImplementation(() => {
        throw new Error();
      });
      function* source() {
        yield onCommand('error-command', commandFn);
        yield command('error-command');
      }

      expect(exec(source)).rejects.toThrow();
    });

    test('errors be should visible inside of the source function that send the command', async () => {
      const commandFn = jest.fn().mockImplementation(() => {
        throw new Error();
      });
      function* source() {
        try {
          yield onCommand('a-command', commandFn);
          yield command('a-command');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      }

      await exec(source);
    });
  });
});
