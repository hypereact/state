import { Action, AnyAction, combineReducers, Store } from "redux";
import { IConfig } from "../interfaces/config";
import { IReducer, Reduce } from "../interfaces/reducer";

export class ReducerManager {
  private initialized: boolean = false;
  private reducersMap: Map<string, IReducer<any>>;
  private actionsMap: Map<string, Reduce<any>> = new Map();
  private combinedReducer: any;
  private removeQueue: string[] = [];
  private store?: Store<any, AnyAction>;

  constructor(initialReducers: IConfig = {}) {
    this.reducersMap =
      initialReducers instanceof Map
        ? initialReducers
        : new Map(Object.entries(initialReducers));
    this.combinedReducer = this.combineReducersMap();
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public setStore(store: Store<any, AnyAction>) {
    this.store = store;
  }

  private combineReducersMap(): any {
    const reducersMapObject: any = {};
    for (let [key, value] of this.reducersMap.entries()) {
      if (typeof (<any>value).setManager === "function"){
        (<any>value).setManager(this);
      }
      reducersMapObject[key] = value.reduce.bind(value);
    }
    return combineReducers(reducersMapObject);
  }

  getReducerKeys(): string[] {
    return [...this.reducersMap.keys()];
  }

  getActionTypes(): string[] {
    return[...this.actionsMap.keys()]
  }

  getReducerByKey(key: string) {
    return this.reducersMap.get(key);
  }

  getReducerByActionType(type: string): Reduce<any> | undefined {
    return this.actionsMap.get(type);
  }

  reduce(state: any, action: Action) {
    if (this.removeQueue.length > 0) {
      state = { ...state };
      for (let key of this.removeQueue) {
        delete state[key];
      }
      this.removeQueue = [];
    }
    const result = this.combinedReducer(state, action);
    if (!this.initialized) {
      this.initialized = true;
    }
    return result;
  }

  addReducer(key: string, reducer: IReducer<any>) {
    this.reducersMap.set(key, reducer);
    this.combinedReducer = this.combineReducersMap();
    this.store?.dispatch({ type: "@@UPDATE" });
  }

  removeReducer(key: string) {
    if (!this.reducersMap.has(key)) {
      return;
    }
    this.reducersMap.delete(key);
    this.removeQueue.push(key);
    this.combinedReducer = this.combineReducersMap();
    this.store?.dispatch({ type: "@@UPDATE" });
  }

  hasActionReducer(type: string) {
    return this.actionsMap.has(type);
  }

  addActionReducer(type: string, reduce: Reduce<any>) {
    this.actionsMap.set(type, reduce);
  }

  removeActionReducer(type: string) {
    if (!this.actionsMap.has(type)) {
      return;
    }
    this.actionsMap.delete(type);
  }
}
