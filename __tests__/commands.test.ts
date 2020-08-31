import { testTools, onCommand, exec, command } from '../src';

describe('Commands', () => {
  beforeEach(async () => {
    expect.hasAssertions();
    await testTools.clearCommands();
  });
  test('sync commands can be registered and executed', async () => {
    const commandFn = jest.fn();

    function* source() {
      yield onCommand('test-command', commandFn);
      yield command('test-command');
    }

    await exec(source);

    expect(commandFn).toHaveBeenCalled();
  });

  test('sync commands can accept arguments and return a value', async () => {
    const commandFn = (value: number) => value + 1;
    function* source() {
      yield onCommand('test-command', commandFn);
      const newValue = yield command('test-command', 1);
      expect(newValue).toBe(2);
    }

    await exec(source);
  });

  test('async commands can be executed', async () => {
    const commandFn = jest.fn().mockImplementation(() => Promise.resolve(1));

    function* source() {
      yield onCommand('test-async-command', commandFn);
      yield command('test-async-command');
    }

    await exec(source);
    expect(commandFn).toHaveBeenCalled();
  });

  test('async commands can accept arguments and return a value', async () => {
    const commandFn = jest
      .fn()
      .mockImplementation((arg) => Promise.resolve(arg));

    function* source() {
      yield onCommand('test-async-command', commandFn);
      const result = yield command('test-async-command', 10);
      expect(result).toBe(10);
    }

    await exec(source);
    expect(commandFn).toHaveBeenCalledWith(10);
  });

  it('should throw and error if we try to assign more that one handler per command', () => {
    function* source() {
      yield onCommand('test-command', setTimeout);
      yield onCommand('test-command', setTimeout);
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
