export class InterfaceUtil {
  static isSliceAction(action: any): boolean {
    return typeof action.type === "string" && typeof action.slice === "string";
  }

  static isReduceableAction(action: any): boolean {
    return (
      InterfaceUtil.isSliceAction(action) && typeof action.reduce === "function"
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
