import genix, { onCommand, exec } from '../src';

describe('Commands', () => {
  beforeEach(async () => {
    expect.hasAssertions();
  });
  test('sync commands can be registered and executed', async () => {
    const commandFn = jest.fn();

    function source() {
      onCommand('test-command', commandFn);
      exec('test-command');
    }

    const wrapper = genix.wrap(source);
    await wrapper.run();

    expect(commandFn).toHaveBeenCalled();
  });

  test('commands can accept arguments and return a value', async () => {
    const commandFn = (value: number) => Promise.resolve(value + 1);

    async function source() {
      onCommand('test-command', commandFn);
      return exec('test-command', 1);
    }

    const wrapper = genix.wrap(source);

    const { data } = await wrapper.run();

    expect(data).toBe(2);
  });

  it('should throw and error if we try to execute a not registered command', async () => {
    function source() {
      exec('no-registered-command', setTimeout);
    }

    const wrapper = genix.wrap(source);

    try {
      await wrapper.run();
    } catch (error) {
      expect(error.message).toBe(
        'Command not registered for [COMMAND: no-registered-command]'
      );
    }
  });

  it('should throw error if command execution fails', async () => {
    const commandFn = jest.fn().mockImplementation(() => {
      throw new Error('Command execution failed');
    });

    function source() {
      onCommand('error-command', commandFn);
      exec('error-command');
    }

    const wrapper = genix.wrap(source);

    try {
      await wrapper.run();
    } catch (error) {
      expect(error.message).toBe('Command execution failed');
    }
  });

  test('errors be should visible inside of the source function that send the command', async () => {
    const commandFn = jest.fn().mockImplementation(() => {
      throw new Error('Command failed');
    });

    function source() {
      try {
        onCommand('a-command', commandFn);
        exec('a-command');
      } catch (error) {
        expect(error.message).toBe('Command failed');
      }
    }

    await genix.wrap(source).run();
  });
});
