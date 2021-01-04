import { IAction } from "../interfaces/action.interface";
import {
  IHydratableReducer,
  IReducer,
  Reduce,
} from "../interfaces/reducer.interface";

export class ReduceableReducer<T> implements IReducer<T> {
  private initialState: T;
  public actions: Map<string, Reduce<T>> = new Map();

  constructor(initialState: T) {
    this.initialState = initialState;
  }

  reduce(state: T, action: IAction): T {
    if (state == null) {
      return this.initialState;
    }
    if (action.type != null) {
      const reduce: Reduce<T> | undefined = this.actions.get(action.type);
      if (reduce != null) {
        return reduce.call(action, state, action);
      }
    }
    return state;
  }
}

export class PersistentReduceableReducer<T>
  extends ReduceableReducer<T>
  implements IHydratableReducer<T> {
  rehydrate(state: T, data: any): T {
    return data;
  }
  dehydrate(state: T) {
    return state;
  }
}
