// eslint-disable-next-line import/prefer-default-export
export const isPromise = (value) =>
  value?.then !== undefined && typeof value.then === 'function';
