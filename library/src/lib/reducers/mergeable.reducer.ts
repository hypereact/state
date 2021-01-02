import { IAction } from "../interfaces/action.interface";
import {
  IHydratableReducer,
  ISliceableReducer,
} from "../interfaces/reducer.interface";
import { StoreManager } from "../managers/store.manager";

export class MergeableReducer<T> implements ISliceableReducer<T> {
  private initialState: T;
  private slice?: string;
  private manager?: StoreManager;

  constructor(initialState: T) {
    this.initialState = initialState;
  }

  initialize(slice: string, manager: StoreManager) {
    this.manager = manager;
    this.slice = slice;
  }

  reduce(state: T, action: IAction): T {
    if (state == null) {
      return this.initialState;
    }
    if (
      this.slice != null &&
      this.slice === action.slice &&
      action.type != null
    ) {
      const nextState: any = JSON.parse(JSON.stringify(state));
      Object.assign(nextState, action);
      delete nextState.slice;
      delete nextState.type;
      return nextState;
    }
    return state;
  }
}

export class PersistentMergeableReducer<T>
  extends MergeableReducer<T>
  implements IHydratableReducer<T> {
  rehydrate(state: T, data: any): T {
    return data;
  }
  dehydrate(state: T) {
    return state;
  }
}
