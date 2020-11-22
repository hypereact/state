import { Action, AnyAction, combineReducers, createStore, Store } from "redux";
import { IAction } from "../interfaces/action.interface";
import { IReducerConfig } from "../interfaces/config.interface";
import {
  IHydratableReducer,
  IReducer,
  Reduce,
} from "../interfaces/reducer.interface";
import { MergeableReducer } from "../reducers/mergeable.reducer";
import { ReduceableReducer } from "../reducers/reduceable.reducer";
import { InterfaceUtil } from "../utils/interface.util";

export class StoreManager {
  private static instance: StoreManager;

  private store!: Store<any, AnyAction>;
  private initialized: boolean = false;
  private reducersMap: Map<string, IReducer<any>> = new Map();
  private hydrationReducersMap: Map<string, IReducer<any>> = new Map();
  private actionsMap: Map<string, Map<string, Reduce<any>>> = new Map();
  private combinedReducers: any = {};
  private combinedReduce: any;
  private removeQueue: string[] = [];
  private fallbackReduce: Reduce<any> = (state: any, action: IAction): any => {
    return state || {};
  };

  private storage: Storage = localStorage;
  private hydration?: Function = undefined;

  static getInstance(
    initialReducers?: IReducerConfig,
    storage?: Storage
  ): StoreManager {
    if (StoreManager.instance == null) {
      StoreManager.instance = new StoreManager(initialReducers, storage);
    } else {
      //TODO add support for multiple initializations
    }
    return StoreManager.instance;
  }

  constructor(initialReducers?: IReducerConfig, storage?: Storage) {
    this.storage = storage || this.storage;
    let entries: any;
    if (initialReducers != null) {
      if (initialReducers instanceof Map) {
        entries = initialReducers.entries();
      } else {
        entries = Object.entries(initialReducers || {});
      }
    }
    if (entries) {
      for (const [key, value] of entries) {
        this.addReducer(key, value);
      }
    }
    this.combinedReduce = this.combineReducers();
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

  private combineReducers(): any {
    if (this.reducersMap.size === 0) {
      return combineReducers({ _: this.fallbackReduce });
    } else {
      return combineReducers(this.combinedReducers);
    }
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
    const result = this.combinedReduce(state, action);
    if (!this.initialized) {
      this.initialized = true;
    }
    let storedState: any = this.storage.getItem("_redux_state_");
    if (storedState != null) {
      storedState = JSON.parse(storedState);
      for (const [key, value] of this.hydrationReducersMap.entries()) {
        result[key] = (value as IHydratableReducer<any>).rehydrate(
          result[key],
          storedState[key]
        );
      }
    }
    return result;
  }

  addReducer(key: string, reducer: IReducer<any>) {
    const isReplaced: boolean = this.reducersMap.has(key);
    if (
      reducer instanceof ReduceableReducer ||
      reducer instanceof MergeableReducer
    ) {
      (<any>reducer)._initialize(key, this);
    }
    if (InterfaceUtil.isReducerHydratable(reducer)) {
      if (this.hydration == null) {
        this.hydration = this.dehydrate.bind(this);
        window.addEventListener("beforeunload", this.hydration as any);
      }
      this.hydrationReducersMap.set(key, reducer);
    }
    this.reducersMap.set(key, reducer);
    this.combinedReducers[key] = reducer.reduce.bind(reducer);
    this.combinedReduce = this.combineReducers();
    this.store?.dispatch({
      type: isReplaced ? "@@REDUCER_REPLACE" : "@@REDUCER_ADD",
    });
  }

  removeReducer(key: string) {
    if (!this.reducersMap.has(key)) {
      return;
    }
    this.reducersMap.delete(key);
    if (this.hydrationReducersMap.has(key)) {
      (this.hydrationReducersMap.get(key) as IHydratableReducer<any>).dehydrate(
        this.getState(key)
      );
      this.hydrationReducersMap.delete(key);
      if (this.hydrationReducersMap.size === 0) {
        window.removeEventListener("beforeunload", this.hydration as any);
        this.hydration = undefined;
      }
    }
    this.removeQueue.push(key);
    delete this.combinedReducers[key];
    this.combinedReduce = this.combineReducers();
    this.store?.dispatch({ type: "@@REDUCER_REMOVE" });
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

  dispatch(action: any): void {
    if (InterfaceUtil.isActionReduceable(action)) {
      if (!this.reducersMap.has(action.slice)) {
        this.addReducer(action.slice, new ReduceableReducer<any>({}));
      }
      if (
        action.type != null &&
        !this.actionsMap?.get(action.slice)?.has(action.type)
      ) {
        this.addActionReducer(action.slice, action.type, action.reduce);
      }
    }
    const pojo = JSON.parse(JSON.stringify(action));
    this.store?.dispatch(pojo);
  }

  private dehydrate(e: BeforeUnloadEvent) {
    const state = this.getState();
    const storedState: any = {};
    for (const [key, value] of this.hydrationReducersMap.entries()) {
      storedState[key] = (value as IHydratableReducer<any>).dehydrate(
        state[key]
      );
    }
    this.storage.setItem("_redux_state_", JSON.stringify(storedState));
    delete e["returnValue"];
  }
}
