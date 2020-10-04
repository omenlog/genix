# Genix

![Build](https://github.com/omenlog/genix/workflows/CI/badge.svg)

`genix` is a library for build [event driven](https://martinfowler.com/articles/201701-event-driven.html) applications in a easy way.
Through `genix` we should be able to create applications with very low levels of coupling which are easy to tests, as main goals it has:

- Decoupling
- Maintainability
- Reliability
- Testing

## Events

First of all we should say that `genix` supports `events` and `commands` as main building blocks, the differences between them are mainly semantic.
Events should indicate actions that already happened, is common use them to notify that something changed in the application, for example `data-loaded` , `order-ready`, `payment-done` etc. One event have one or more handlers associate to it, for example:

```js
import { onEvent, emit } from 'genix';

function f1() {
  onEvent('data-loaded', (data) => {
    console.log(data);
  });
}

function f2() {
  const data = { user: 'user' };
  emit('data-loaded', data);
}

f1();
f2(); // {user: 'user'}
```

In the above functions, the first one register a handler for `data-loaded` event and in the second this event is emitted.
`genix` allow chain any numbers of events in a way that events can be emitted from handlers, so the following can be done:

```js
import { onEvent, emit } from 'genix';

function f1() {
  onEvent('data-loaded', function* () {
    console.log(data);
    emit('data-processed', true);
  });
}
```

In the previous example first `data-loaded` is emitted and then `data-processed`.

## Commands

In other hand `commands` are meant to indicate something which should happen.
`commands` They should be named with a verb in imperative mood.
When we trigger a command `genix` execute the handler associate with this command and return its value.
The main differences between `events` and `commands` are that `genix` only allow one handler per command and we can get a return value after execute a command which can't happen in the case of `events`.
Examples of commands can be `load-data`, `prepare-order`, `execute-payment`.

```js
import { onCommand, command } from 'genix';

function store() {
  const user = {
    Bob: {
      job: 'Software developer',
      userId: 1,
    },
  };

  onCommand('get-user', (userName) => {
    // Commands handlers can receive arguments
    return data[userName];
  });
}

function app() {
  const userInfo = command('get-user', 'Bob');
  console.log(userInfo); // {userId: 1, job: 'Software Developer'}
}

store();
app();
```

Commands handlers can be any kind of function sync or async it doesn't matter `genix` will handle them correctly, and also from commands handlers we can emit `events`.

## Testing

Before was mentioned that low coupling is one of the main goals of `genix` making in this way applications easier to test. In order to achieve that `genix` allow us wrap our function to emit events and commands against them, let's see an example:

Suppose that we have a `counter` function which is in charge to increment and decrement a specific value, this function wil react to `increment` command, also it expose a command `get-value` that return the actual value of our counter. Also this function has a handler for `state-restored` event which will cause that our counter goes to zero.

```js
import { onCommand, onEvent } from 'genix';

function counter() {
  let value = 0;

  onCommand('increment', () => {
    value++;
  });

  onCommand('get-value', () => value);

  onEvent('state-restored', () => {
    value = 0;
  });
}

export default counter;
```

Now is time to test this function so we can ensure that it work correctly, let's see how `genix` can help us with that:

```js
import genix from 'genix';
import counter from './counter';

describe('Counter', () => {
  it('should increment value correctly', async () => {
    const wrapper = genix.wrap(counter);

    wrapper.exec('increment').exec('increment').exec('get-value');

    const { result } = await wrapper.run();

    expect(results).toBe(2);
  });
});
```

Before continue with more tests a few things should be notice. First as we mention `genix` allow us wrap our functions so we can `exec` commands against it and also `emit` events.
This operations are lazy in the sense that they are executed when the `run` function is called not before that. The `run` is asynchronous so this has as consequence that every test that use a `genix` wrapper should be an `async` test.
After executed `run` we got and object that have a `result` property with the return value of the last command executed in our chain of operations for example if we execute this operations `increment`, `state-restored`, `get-value` then `result` will have the return value of `get-value` because it was the last command executed.
Last but not least \*\*functions using `genix` capabilities always should be wrapped in order to be tested, this is highly recommended in order to avoid race conditions and incorrect behaviors during testing.
Being said this let's write a few more tests:

```js
it('should decrement value correctly', () => {
    const wrapper = genix.wrap(counter);

    wrapper
      .exec('increment')
      .exec('increment')
      .exec('decrement')
      .exec('get-value');

    const { result } = await wrapper.run();

    expect(results).toBe(1);
});

it('should restore counter value correctly', () => {
    const wrapper = genix.wrap(counter);

    wrapper
      .exec('increment')
      .exec('decrement')
      .emit('state-restored')
      .exec('get-value');

    const { result } = await wrapper.run();

    expect(results).toBe(0);
});

```

This are basic examples but show some of the capabilities of `genix` during testing, there missing parts here as inject fake commands during tests, capture events triggered during function execution. All of this will be covered in a section dedicated to fully cover the testing API in depth.

## Examples

- [Hello World](https://github.com/omenlog/genix/blob/master/docs/examples/hello-world.md)
- [Simple Counter](https://github.com/omenlog/genix/blob/master/docs/examples/counter.md)

## Future Plans

- Improve documentation.
- Add more examples.
- Improve type coverage in the source code.
- Integrate with React.js.
- Integrate `genix` to use web workers under the hood.
