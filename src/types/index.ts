export type Commands = Record<string, Function>;

export type WrapperResult = {
  data: any;
  events: Record<string, any[]>;
};

export type Handlers = Record<string, Map<Function, Function>>;
