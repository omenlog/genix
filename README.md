# Genix

![Build](https://github.com/omenlog/genix/workflows/CI/badge.svg)

Genix is a library for build event driven applications in a easy way using **generators as source of events**.
Through `genix` we should be able to create applications with very low levels of coupling which are easy to tests, the main goals of `genix` are:

- Decoupling
- Maintainability
- Reliability
- Smooth Developer Experience

## Events

First of all we should say that `genix` supports `events` and `commands`, the differences between them are mainly semantic.
Events indicate actions that already happened, is common use them to notify that something changed in the application, for example `data-loaded` , `order-ready`, `payment-done` etc.
An event can have more that one handler associate to it. Examples:

```js
import { onEvent, emit } from 'genix';

function* f1() {
  yield onEvent('data-loaded', (data) => {
    console.log(data);
  });
}

function* f2() {
  const data = { user: 'user' };
  yield emit('data-loaded', data);
}
```

In the above functions, the first one register an event handler and in the second one the event is emitted.
In `genix` we can have generators as event handler allow the library in this way chain any numbers of events, so the following can be done:

```js
import { onEvent, emit } from 'genix';

function* f1() {
  yield onEvent('data-loaded', function* () {
    console.log(data);
    yield emit('data-processed', true);
  });
}
```

In this example when `data-loaded` is emitted, data is printed in the console and after that `data-processed` is emitted.

## Commands

In other hand `commands` are meant to indicate something which should happen and we as developers want it.
They should be named with a verb in imperative mood.
When we trigger a command `genix` execute the handler associate with this command and return its value.
Is important note that `genix` only allow one handler per command being this one of the main difference between `events` and `commands`. Examples of commands can be `load-data`, `prepare-order`, `execute-payment`.

```js
import { onCommand, command } from 'genix';

function* store() {
  const data = {
    bob: {
      job: 'Software developer',
      alice: 'QA',
    },
  };

  yield onCommand('get-user', (userName) => {
    // Commands handlers can receive arguments
    return data[userName];
  });
}

function* app() {
  const userInfo = yield command('get-user', 'bob');
  console.log(userInfo);
}
```

Commands handlers can be any kind of function sync or async it doesn't matter `genix` will handle them correctly, but as command handlers we can't have a generator function.

## Execution

So far we saw the main building blocks of `genix` as generators functions, also were introduced the concepts of `events` and `commands`, but until this point every generator function showed doesn't do anything beyond the function declaration.
We need to execute our generators in order to have them integrated in the `genix` core, for this `genix` provide an `exec` function which in charge of generators execution.
Suppose that the previous `app` and `store` generator were implemented then:

```js
import {exec} from 'genix',
import {store, app} from './generators'

async function main(){
    await exec(store); // exec return a Promise
    await exec(app)
}

main()
```

Now our generators are up and running integrated with each other correctly.

## g Function

As `genix` has at its core the concept of generator there should be a way to integrate this generators function with existing JS apis which expect as callback a normal function.
The `g` function allow us make this integration in a neat way. For example suppose that we want emit some value after 1 seconds using the JS `setTimeout` function, let's see how we can put together `genix` and this callbacks based functions:

```js
import { onEvent, emit, exec, g } from 'genix';

function* logger() {
  yield onEvent('value', (value) => {
    console.log(value);
  });
}

async function main() {
  await exec(logger);

  setTimeout(
    g(function* () {
      yield emit('value', 10);
    })
  );
}

main();
```

Note how wrapping a generator function using `g` we get a normal function that can be passed around, so in this way we link `genix` core with different parts of our applications.

## Examples

- [Hello World](https://github.com/omenlog/genix/blob/master/docs/examples/hello-world.md)
- [Simple Counter](https://github.com/omenlog/genix/blob/master/docs/examples/counter.md)

## Future

- Improve documentation.
- Add examples.
- Improve type coverage in the source code.
- Integrate with React.js.
- Allow `genix` run generators in a different workers.
