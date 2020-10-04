This example show a simple counter that increments a variable every second and print it to the console, if during this process the user input `r` then the counter goes to zero.

First lets implement a `counter` function which be responsible for handle our value, this function register handlers for `tick` and `reset` events.

```js
import { onEvent, emit } from '../src';

function counter() {
  let i = 0;

  function onTick() {
    console.log(i);
    i += 1;
  }

  function onReset() {
    console.log('Resetting clock');
    i = 0;
  }

  onEvent('tick', onTick);
  onEvent('reset', onReset);
}
```

Now our `ticker` function will be responsible of emit a `tick` event every second

```js
function ticker() {
  setInterval(() => {
    emit('tick');
  }, 1000);
}
```

```js
const onData = g(function* (data: Buffer) {
  if (data.toString() === 'r\n') {
    yield emit('reset');
  }
});
```

Our `main` function will be the entry point of this example:

```js
function main() {
  process.stdin.on('data', (data: Buffer) => {
    if (data.toString() === 'r\n') {
      emit('reset');
    }
  });

  counter();
  ticker();
}

main();
```

`main` register handler for `data` event of `stdin`, we execute the `counter` in order to register our handlers and after that `ticker` execution start.

This example is simple but show how decoupled are the components, also exemplify how `genix` allow us implement privacy through closures, the variable `i` is only visible to `counter` and can be only modified trough the public api of it or more specifically only using the `events` registered by this function.
