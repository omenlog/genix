export type Commands = Record<string, Function>;

export type Source = (
  ...args: any[]
) => Generator<Event_, any, { unsubscribe: () => void }>;
export type Sources = Record<string, Source>;

export type Handlers = Record<string, Map<Source, Source>>;

type EmitEvent = {
  meta: {
    type: 'event-emited';
    name: string;
    args: any[];
  };
  fn: (it: Generator) => Promise<any>;
};

type Handler = {
  meta: {
    type: 'new-handler';
  };
  fn: (it: Generator) => Promise<any>;
};

type RegisterSource = {
  meta: {
    type: 'register-source';
  };
  fn: (it: Generator) => Promise<any>;
};

type NewCommand = {
  meta: {
    type: 'new-command';
  };
  fn: (it: Generator) => Promise<void>;
};

type RunCommand = {
  meta: {
    type: 'run-command';
  };
  fn: (it: Generator) => Promise<any>;
};

export type Event_ =
  | Handler
  | EmitEvent
  | RunCommand
  | RegisterSource
  | NewCommand;

type IteratorValue<T> = { done: boolean; value: T };

export type HandlerEvent = IteratorValue<Handler>;
