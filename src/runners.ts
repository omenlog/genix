import { EventIterator, Event_ } from './types';

const validateOperation = (ev: Event_) => {
  if(!ev.meta || !ev.fn){
    throw new Error('Invalid Operation');
  }
} 

async function run(it: EventIterator, payload: any = {}): Promise<any> | never  {
  let iter = it.next(payload);
  let result;

  while(!iter.done) {
    validateOperation(iter.value)
    result = await iter.value.fn(it);
    iter = it.next(result)
  }
 
  return iter.value
}

async function testRun(
  it: EventIterator,
  payload: any,
  events: any
): Promise<{result: any, events: any}> {
  let iter = it.next(payload);
  let result;

  while(!iter.done){
    const {value} = iter;
    validateOperation(value)

    if(value.meta.type === 'event-emited'){
      events[value.meta.name] = { args: value.meta.args };
    }

    result = await value.fn(it);
    iter = it.next(result);
  }

  return {result : iter.value, events}
}

export { run, testRun };
