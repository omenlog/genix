This example show a simple counter that increments a variable every second and print it to the console, if during this process the user input `r` then the counter goes to zero.

First lets see a `counter` generator, in this we add handlers for `tick` and `reset` events

```js
import { onEvent, exec, g, emit } from '../src';

function* counter() {
  let i = 0;

  function onTick() {
    console.log(i);
    i += 1;
  }

  function onReset() {
    console.log('Resetting clock');
    i = 0;
  }

  yield onEvent('tick', onTick);
  yield onEvent('reset', onReset);
}
```

Now our `ticker` function will be responsible of emit a `tick` event every second

```js
function ticker() {
  const emitTick = g(function* () {
    yield emit('tick');
  });

  setInterval(emitTick, 1000);
}
```

> In this case there is not need to `ticker` be a generator, the generator is used only to emit `tick` event during the `setInterval` callback

The next function `onData` will process incoming data from `stdin` and check if the user input was `r` to then emit `reset` event.

```js
const onData = g(function* (data: Buffer) {
  if (data.toString() === 'r\n') {
    yield emit('reset');
  }
});
```

Our `main` function will be the entry point of this example:

```js
async function main() {
  process.stdin.on('data', onData);

  await exec(counter);

  ticker();
}

main();
```

`main` register handler for `data` event of `stdin`, this is the reason for define the `onData` function using the `g` function, remember that this function help us use generators as callbacks, we execute the `counter` generator in order to register our handler and after that our `ticker` execution start.

This example is simple but show how decoupled are the components, also exemplify how `genix` allow us implement privacy through closures, the variable `i` is only visible to `counter` generator and can be only modified trough the public api of this generator or more specifically only using the `events` registered in this generator.
