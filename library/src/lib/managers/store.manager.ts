import { Action, AnyAction, combineReducers, createStore, Store } from "redux";
import { IAction } from "../interfaces/action";
import { IConfig } from "../interfaces/config";
import { IReducer, Reduce } from "../interfaces/reducer";
import { ReduceableReducer } from "../reducers/reduceable.reducer";

export class StoreManager {
  private store!: Store<any, AnyAction>;
  private initialized: boolean = false;
  private reducersMap: Map<string, IReducer<any>> = new Map();
  private actionsMap: Map<string, Map<string, Reduce<any>>> = new Map();
  private combinedReducer: any;
  private removeQueue: string[] = [];

  constructor(initialReducers?: IConfig) {
    if (initialReducers != null && initialReducers instanceof Map) {
      this.reducersMap = initialReducers;
    } else {
      this.reducersMap = new Map(Object.entries(initialReducers || {}));
    }
    this.combinedReducer = this.combineReducersMap();
    this.store = createStore(
      this.reduce.bind(this),
      (<any>window)?.__REDUX_DEVTOOLS_EXTENSION__?.()
    );
  }

  getStore(): Store<any, AnyAction> {
    return this.store;
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
      if (value instanceof ReduceableReducer) {
        (<any>value)._initialize(key, this);
      }
      reducersMapObject[key] = value.reduce.bind(value);
    }
    return combineReducers(reducersMapObject);
  }

  getSlices(): string[] {
    return [...this.reducersMap.keys()];
  }

  getReduceableActionTypes(): string[] {
    return [...this.actionsMap.keys()];
  }

  getReduceByActionType(slice: string, type: string): Reduce<any> | undefined {
    return this.actionsMap.get(slice)?.get(type);
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

  addActionReducer(slice: string, type: string, reduce: Reduce<any>) {
    if (!this.actionsMap.has(slice)) {
      this.actionsMap.set(slice, new Map());
    }
    this.actionsMap.get(slice)?.set(type, reduce);
  }

  removeActionReducer(type: string) {
    if (!this.actionsMap.has(type)) {
      return;
    }
    this.actionsMap.delete(type);
  }

  getState(key?: string): any | undefined {
    if (key) {
      return this.store?.getState()?.[key] as any;
    } else {
      return this.store?.getState() as any;
    }
  }

  dispatch(action: IAction) {
    if (this.isActionReduceable(action)) {
      if (!this.reducersMap.has(action.slice)) {
        this.addReducer(action.slice,new ReduceableReducer<any>({}));
      }
      if (!this.actionsMap?.get(action.slice)?.has(action.type)) {
        this.addActionReducer(action.slice, action.type, action.reduce);
      }
    }
    const pojo = JSON.parse(JSON.stringify(action));
    this.store?.dispatch(pojo);
  }

  private isActionReduceable(action: IAction): boolean {
    return (
      typeof action.reduce === "function" &&
      typeof action.type === "string" &&
      typeof action.slice === "string"
    );
  }
}
