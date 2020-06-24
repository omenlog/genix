import { Commands, Event_ } from './types';

let commands: Commands = {};

function onCommand(name: string, commandFn: Function): Event_ {
  return {
    meta: {
      type: 'new-command',
    },
    async fn(it: Generator) {
      if (commands[name] !== undefined) {
        it.throw(new Error('Not allowed more then one handler per command'));
      } else {
        commands[name] = commandFn;
      }
    },
  };
}

function command(commandName: string, ...args: any[]): Event_ {
  return {
    meta: {
      type: 'run-command',
    },
    async fn(it: Generator) {
      const com = commands[commandName];
      if (!com) {
        it.throw(
          new Error(`Command not registered for [COMMAND: ${commandName}]`)
        );
      } else {
        try {
          return com(...args);
        } catch (error) {
          it.throw(error);
        }
      }
    },
  };
}

function clear() {
  commands = {
    'test.utils.clearCommands': clear,
  };
}

function* commandsSrc() {
  if (process.env.NODE_ENV === 'test') {
    yield onCommand('test.utils.clearCommands', clear);
  }
}

export { onCommand, command, commandsSrc };
