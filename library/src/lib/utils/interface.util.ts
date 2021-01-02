export class InterfaceUtil {
  static isReduceableAction(action: any): boolean {
    return (
      typeof action.type === "string" &&
      typeof action.slice === "string" &&
      typeof action.reduce === "function"
    );
  }

  static isSliceableReducer(reducer: any): boolean {
    return (
      typeof reducer.reduce === "function" &&
      typeof reducer.initialize === "function"
    );
  }

  static isHydratableReducer(reducer: any): boolean {
    return (
      typeof reducer.reduce === "function" &&
      typeof reducer.rehydrate === "function" &&
      typeof reducer.dehydrate === "function"
    );
  }
}
