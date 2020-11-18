import { IAction } from "../interfaces/action";
import { IReducer, Reduce } from "../interfaces/reducer";
import { StoreManager } from "../managers/store.manager";

export class ReduceableReducer<T> implements IReducer<T> {
  private initialState: T;
  private slice?: string;
  private manager?: StoreManager;

  constructor(initialState: T) {
    this.initialState = initialState;
  }

  _initialize(slice: string, manager: StoreManager) {
    this.manager = manager;
    this.slice = slice;
  }

  reduce(state: T, action: IAction): T {
    if (state == null) {
      return this.initialState;
    }
    if (this.slice != null && this.slice === action.slice) {
      const reduce:
        | Reduce<T>
        | undefined = this?.manager?.getReduceByActionType?.(
        action.slice,
        action.type
      );
      if (typeof reduce === "function") {
        return reduce.call(action, JSON.parse(JSON.stringify(state)), action);
      }
    }
    return state;
  }
}
