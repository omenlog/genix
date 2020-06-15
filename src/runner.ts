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

export default run;
