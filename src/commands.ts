import { emit } from './events';
import { Commands } from './types';

let commands: Commands = {};

type CommandConfiguration = {
  remove: () => void;
};

function onCommand(
  commandName: string,
  commandFn: Function
): CommandConfiguration {
  if (commands[commandName] !== undefined) {
    throw new Error('Not allowed more than one handler per command');
  } else {
    commands[commandName] = commandFn;
  }

  return {
    remove: () => delete commands[commandName],
  };
}

function exec(commandName: string, ...args: any[]) {
  const com = commands[commandName];
  if (!com) {
    throw new Error(`Command not registered for [COMMAND: ${commandName}]`);
  } else {
    return com(...args);
  }
}

function initCommands() {
  onCommand('genix-clear-commands', () => {
    commands = {};
    emit('genix-commands-cleared');
    initCommands();
  });
}

initCommands();

export { onCommand, exec };
