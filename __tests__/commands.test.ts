import { onCommand, exec } from '../src';

describe('Commands', () => {
  beforeEach(async () => {
    expect.hasAssertions();
  });
  // await testTools.clearCommands();
  test('sync commands can be registered and executed', () => {
    const commandFn = jest.fn();

    function source() {
      const c = onCommand('test-command', commandFn);
      exec('test-command');
      c.remove();
    }

    source();

    expect(commandFn).toHaveBeenCalled();
  });

  test('commands can accept arguments and return a value', async () => {
    const commandFn = (value: number) => Promise.resolve(value + 1);

    async function source() {
      const c = onCommand('test-command', commandFn);
      const value = exec('test-command', 1);
      c.remove();

      return value;
    }

    const value = await source();
    expect(value).toBe(2);
  });

  it('should throw and error if we try to execute a not registered command', () => {
    function source() {
      exec('no-registered-command', setTimeout);
    }

    expect(source).toThrow();
  });

  it('should throw error if command execution fails', () => {
    const commandFn = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    let c;

    function source() {
      c = onCommand('error-command', commandFn);
      exec('error-command');
    }

    expect(source).toThrow();
    c.remove();
  });

  test('errors be should visible inside of the source function that send the command', async () => {
    const commandFn = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    function source() {
      let c;
      try {
        c = onCommand('a-command', commandFn);
        exec('a-command');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        c.remove();
      }
    }

    source();
  });
});
