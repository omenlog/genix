export type Handlers = Record<string, Function[]>;
export type Commands = Record<string, Function>;

export type Source = (args?: any) => Generator<Event_>;
export type Sources = Record<string, Source>;

type EmitEvent = {
  type: 'event-emited';
  payload: {
    eventName: string;
    args? : any;
  };
}

type NewCommand = {
  type: 'new-command';
  payload: {
    name: string;
    commandFn: Function;
  };
};

type RunCommand = {
  type: 'run-command';
  payload: {
    commandName: string;
    args? : any;
  };
}

type Handler = {
  type: 'new-handler';
  payload: {
    eventName: string;
    handlerFn: Source;
  };
};

type RegisterSource = {
  type: 'register-source';
  payload: {
    args: any[];
    sourceFn: Source;
  };
};

export type Event_ =
  | Handler
  | EmitEvent
  | RunCommand
  | RegisterSource
  | NewCommand

type IteratorValue<T> = {done: boolean; value: T};

export type HandlerEvent = IteratorValue<Handler>;
