import genix, { emit, onCommand, onEvent } from '../src';

describe('Test Tools', () => {
  test('functions can be wrapped in order to execute events and commands against them', async () => {
    function counter() {
      let value = 0;

      onEvent('tick', () => {
        emit('tick_emitted', value);
        value += 1;
      });

      onEvent('reset', () => {
        emit('reset_emitted');
        value = 0;
      });

      onCommand('get-value', () => {
        return value;
      });
    }

    const wrapper = genix.wrap(counter);
    wrapper.emit('tick').emit('tick').emit('reset').exec('get-value');

    const { data, events } = await wrapper.run();

    expect(data).toBe(0);
    expect(events.tick_emitted.length).toBe(2);
    expect(events.tick_emitted[0]).toBe(0);

    expect(events.reset_emitted).toBeDefined();
  });

  test('functions with async handlers are wrapped and executed correctly', async () => {
    function source() {
      let value = 9;

      onCommand('add-value-after-2-seconds', (newValue) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            value += newValue;
            resolve();
          }, 2000);
        });
      });

      onCommand('divide-value-after-1-second', (newValue) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            value /= newValue;
            resolve();
          }, 1000);
        });
      });

      onCommand('get-value', () => {
        return value;
      });
    }

    const wrapper = genix.wrap(source);

    const { data } = await wrapper
      .exec('add-value-after-2-seconds', 1)
      .exec('divide-value-after-1-second', 2)
      .exec('get-value')
      .run();

    expect(data).toBe(5);
  });
});
