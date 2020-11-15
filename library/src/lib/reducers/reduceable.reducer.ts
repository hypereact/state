import { IAction } from "../interfaces/action";
import { IReducer, Reduce } from "../interfaces/reducer";
import { ReducerManager } from "../services/reducer.manager";

export class ReduceableReducer<T> implements IReducer<T> {
    private initialState: T;
    private manager?: ReducerManager;

    constructor (initialState: T) {
        this.initialState = initialState;
    }

    setManager(manager: ReducerManager) {
      this.manager = manager;
    }
    
    reduce(state: T, action: IAction): T {
      if (state == null) {
        return this.initialState;
      }
      const reduce: Reduce<T> | undefined = this?.manager?.getReducerByActionType?.(action.type);
      if (typeof reduce === "function") {
        return reduce.call(action, state, action);
      }
      return state;
    }
}