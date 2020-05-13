export type Handlers = Record<string, Function[]>;
export type Commands = Record<string, Function>;

export type Source = (args?: any) => Generator<Event_, void>;
export type Sources = Record<string, Source>;

type NewCommand = {
  type: 'new-command';
  name: string;
  commandFn: Function;
};

type AsyncCommand = {
  type: 'async-command';
  name: string;
  args?: any;
};

type SyncCommand = {
  type: 'sync-command';
  name: string;
  args?: any[];
};

type Handler = {
  type: 'new-handler';
  eventName: string;
  handlerFn: Source;
};

type NewSource = {
  type: 'new-source';
  sourceName: string;
  sourceFn: Source;
};


type RunSource = {
  type: 'run-source';
  sourceFn: Source;
  args: any[];
};

export type Event_ =
  | Handler
  | AsyncCommand
  | SyncCommand
  | NewCommand
  | NewSource
  | RunSource;

type IteratorValue<T> = {done: boolean; value: T};

export type HandlerEvent = IteratorValue<Handler>;
export type AsyncCommandEvent = IteratorValue<AsyncCommand>;
export type RunSourceEvent = IteratorValue<RunSource>;
export type SyncCommandEvent = IteratorValue<SyncCommand>;
