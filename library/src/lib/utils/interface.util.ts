export class InterfaceUtil {
  static isActionReduceable(action: any): boolean {
    return (
      typeof action.type === "string" &&
      typeof action.slice === "string" &&
      typeof action.reduce === "function"
    );
  }

  static isReducerHydratable(reducer: any): boolean {
    return (
      typeof reducer.reduce === "function" &&
      typeof reducer.rehydrate === "function" &&
      typeof reducer.dehydrate === "function"
    );
  }
}
