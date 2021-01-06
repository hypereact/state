import { IAction } from "../interfaces/action.interface";
import { IHydratableReducer, IReducer } from "../interfaces/reducer.interface";

export class MergeableReducer<T> implements IReducer<T> {
  private initialState: T;

  constructor(initialState: T) {
    this.initialState = initialState;
  }

  reduce(state: T, action: IAction): T {
    if (state == null) {
      return this.initialState;
    }
    const nextState: any = JSON.parse(JSON.stringify(state));
    Object.assign(nextState, action);
    delete nextState.slice;
    delete nextState.type;
    return nextState;
  }
}

export class PersistentMergeableReducer<T>
  extends MergeableReducer<T>
  implements IHydratableReducer<T> {
  rehydrate(state: T, data: any): T | Promise<T> {
    return data;
  }
  dehydrate(state: T): any {
    return state;
  }
}
