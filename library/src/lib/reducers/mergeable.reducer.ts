import { IAction } from "../interfaces/action.interface";
import { ISliceReducer } from "../interfaces/reducer.interface";
import { StoreManager } from "../managers/store.manager";

export class MergeableReducer<T> implements ISliceReducer<T> {
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
