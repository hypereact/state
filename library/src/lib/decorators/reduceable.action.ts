export function Action(type: string, slice: string) {
  return function decorator<T extends { new (...args: any[]): {} }>(
    constructor: T
  ) {
    return class extends constructor {
      type = type;
      slice = slice;
    };
  };
}
