## Hello World

In this example we'll see a simple `Hello World` script using `genix` events and commands.

### Hello World using events

```js
import { onEvent, emit } from 'genix';

function setupGreetings() {
  onEvent('world-prepared', () => {
    console.log('Hello World');
  });
}

function main() {
  emit('world-prepared');
}

setupGreetings();
main();
```

In this example we get `Hello World` printed in response to `world-prepared` event, note how easy is register and trigger events.

### Hello World with commands

```js
import { onCommand, exec } from 'genix';

function setupGreetings() {
  onCommand('get-message', () => 'Hello World');
}

function main() {
  const message = exec('get-message');
  console.log(message);
}
```

Again we see `Hello World` printed in the console, the difference here is that `console` use a value emitted by the `command` function, and with `events` the handler function is who print the value in the console.
