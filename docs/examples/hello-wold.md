## Hello World

In this example we'll see a very simple `Hello World` script using `genix` events and commands.

### Hello World using events

```js
import { exec, onEvent, emit } from 'genix';

/* first generator executed register a handler for "greetings" event */
exec(function* () {
  yield onEvent('greetings', () => console.log('Hello World'));
});

/* second generator emit "greetings" event */
exec(function* () {
  yield emit('greetings');
});
```

In this example we get `Hello World` printed in response to `greetings` event, note how easy is register and trigger events.

> The `exec` function return a promise, but here for the sake of simplicity wasn't `await` used

### Hello World with commands

```js
import { exec, onCommand, command } from 'genix';

/* the first generator register a "greetings" commands */
exec(function* () {
  yield onCommand('greetings', () => 'Hello World');
});

/* in the second generator the "greetings" commands is executed and its result is printed */
exec(function* () {
  const response = yield command('greetings');
  console.log(response);
});
```

Again we see `Hello World` printed in the console, the difference here is that `console` use a value emitted by the `command` function, and with `events` the handler function is who print the value in the console.
