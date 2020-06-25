import { Event_ } from './types';

async function run(it: Generator, payload: any = {}): Promise<any> {
  const { done, value } = it.next(payload);

  if (done) {
    return value;
  }

  if (!value.meta || !value.fn) {
    throw new Error('Invalid Operation');
  }

  const result = await value.fn(it);
  return run(it, result);
}

async function testRun(
  it: Generator<Event_>,
  payload: any,
  events: any
): Promise<any> {
  const { done, value }: IteratorResult<Event_> = it.next(payload);

  if (done) {
    return {
      result: value,
      events,
    };
  }

  if (value.meta.type === 'event-emited') {
    // eslint-disable-next-line no-param-reassign
    events[value.meta.name] = { args: value.meta.args };
    return testRun(it, payload, events);
  }

  const result = await value.fn(it);
  return testRun(it, result, events);
}

export { run, testRun };
