export function freeze(object: any) {
  if (object != null) {
    const propNames = Object.getOwnPropertyNames(object);
    for (const name of propNames) {
      const value = object[name];
      if (value && typeof value === "object") {
        freeze(value);
      }
    }
  }
  return Object.freeze(object);
}
