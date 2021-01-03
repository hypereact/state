import { Action, AnyAction, combineReducers, createStore, Store } from "redux";
import { IAction } from "../interfaces/action.interface";
import { IReducerConfig } from "../interfaces/config.interface";
import {
  IHydratableReducer,
  IReducer,
  Reduce,
} from "../interfaces/reducer.interface";
import { ReduceableReducer } from "../reducers/reduceable.reducer";
import { InterfaceUtil } from "../utils/interface.util";

export class StoreManager {
  private static instance?: StoreManager;

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
  private removeFallback: boolean = false;

  private storage: Storage = localStorage;
  private storageKey: string = "_redux_state_";
  private hydration?: Function = undefined;

  public static getInstance(
    reducers?: IReducerConfig,
    storage?: Storage
  ): StoreManager {
    // normalize args
    let config: Map<string, IReducer<any>>;
    if (reducers instanceof Map) {
      config = reducers;
    } else {
      config = new Map();
      for (const [key, value] of Object.entries(reducers || {})) {
        config.set(key, value);
      }
    }

    let instance = StoreManager.instance;
    if (instance == null) {
      // create a new instance
      instance = StoreManager.instance = new StoreManager(
        config.entries(),
        storage
      );
    } else if (reducers != null) {
      // reconfigure current instance (remove/add reducers)
      for (const key of instance.reducersMap.keys()) {
        if (!config.has(key)) {
          instance.removeReducer(key);
        }
      }
      for (const [key, value] of config.entries()) {
        if (!instance.reducersMap.has(key)) {
          instance.addReducer(key, value);
        }
      }
    }

    return instance;
  }

  public static dispose() {
    if (StoreManager.instance != null) {
      StoreManager.instance.__dispose();
    }
  }

  private __dispose() {
    if (this.hydration != null) {
      window.removeEventListener("beforeunload", this.hydration as any);
      this.hydration = undefined;
    }
    StoreManager.instance = undefined;
  }

  constructor(
    entries: IterableIterator<[any, IReducer<any>]>,
    storage?: Storage
  ) {
    this.storage = storage || this.storage;
    for (const [key, value] of entries) {
      this.addReducer(key, value);
    }
    this.combinedReduce = this.setupCombineReduce();
    this.store = createStore(
      this.reduce.bind(this),
      (<any>window)?.__REDUX_DEVTOOLS_EXTENSION__?.()
    );
  }

  public getStore(): Store<any, AnyAction> {
    return this.store;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  public getSlices(): string[] {
    return [...this.reducersMap.keys()];
  }

  public getState(key?: string): any | undefined {
    if (key) {
      return this.store?.getState()?.[key] as any;
    } else {
      return this.store?.getState() as any;
    }
  }

  public dispatch(action: any): void {
    if (InterfaceUtil.isReduceableAction(action)) {
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

  private reduce(state: any, action: Action) {
    if (this.removeQueue.length > 0) {
      state = { ...state };
      for (let key of this.removeQueue) {
        delete state[key];
      }
      this.removeQueue = [];
    }
    if (state != null && this.removeFallback) {
      delete state["_"];
    }
    const result = this.combinedReduce(state, action);
    if (!this.initialized) {
      this.initialized = true;
      let storedState: any = this.storage.getItem(this.storageKey);
      if (storedState != null) {
        storedState = JSON.parse(storedState);
        //TODO persist in-memory for lazy registered reducers
        for (const [key, value] of this.hydrationReducersMap.entries()) {
          try {
            result[key] = (value as IHydratableReducer<any>).rehydrate(
              result[key],
              storedState[key]
            );
          } catch (e) {}
        }
      }
      this.storage.removeItem(this.storageKey);
    }
    return result;
  }

  public addReducer(key: string, reducer: IReducer<any>) {
    //TODO support reducer replace
    const isReplaced: boolean = this.reducersMap.has(key);
    if (isReplaced) {
      return;
    }
    if (InterfaceUtil.isSliceableReducer(reducer)) {
      (<any>reducer).initialize(key, this);
    }
    if (InterfaceUtil.isHydratableReducer(reducer)) {
      if (this.hydration == null) {
        this.hydration = this.dehydrate.bind(this);
        window.addEventListener("beforeunload", this.hydration as any);
      }
      this.hydrationReducersMap.set(key, reducer);
    }
    this.reducersMap.set(key, reducer);
    this.combinedReducers[key] = reducer.reduce.bind(reducer);
    this.combinedReduce = this.setupCombineReduce();
    this.store?.dispatch({
      type: isReplaced ? "@@REDUCER_REPLACE" : "@@REDUCER_ADD",
      key,
    });
  }

  public removeReducer(key: string) {
    if (!this.reducersMap.has(key)) {
      return;
    }
    if (this.actionsMap.has(key)) {
      this.actionsMap.delete(key);
    }
    if (this.hydrationReducersMap.has(key)) {
      //TODO persist in-memory for lazy registered reducers
      (this.hydrationReducersMap.get(key) as IHydratableReducer<any>).dehydrate(
        this.getState(key)
      );
      this.hydrationReducersMap.delete(key);
      if (this.hydrationReducersMap.size === 0) {
        window.removeEventListener("beforeunload", this.hydration as any);
        this.hydration = undefined;
      }
    }
    this.reducersMap.delete(key);
    this.removeQueue.push(key);
    delete this.combinedReducers[key];
    this.combinedReduce = this.setupCombineReduce();
    this.store?.dispatch({ type: "@@REDUCER_REMOVE", key });
  }

  public __getReduceByActionType(
    slice: string,
    type: string
  ): Reduce<any> | undefined {
    return this.actionsMap.get(slice)?.get(type);
  }

  private setupCombineReduce(): any {
    if (this.reducersMap.size === 0) {
      this.removeFallback = true;
      return combineReducers({ _: this.fallbackReduce });
    } else {
      return combineReducers(this.combinedReducers);
    }
  }

  private addActionReducer(slice: string, type: string, reduce: Reduce<any>) {
    if (!this.actionsMap.has(slice)) {
      this.actionsMap.set(slice, new Map());
    }
    this.actionsMap.get(slice)?.set(type, reduce);
  }

  private dehydrate(event: BeforeUnloadEvent) {
    delete event["returnValue"];
    if (this.storage.getItem(this.storageKey) != null) {
      this.storage.removeItem(this.storageKey);
      return;
    }
    const state = this.getState();
    const storedState: any = {};
    for (const [key, value] of this.hydrationReducersMap.entries()) {
      try {
        storedState[key] = (value as IHydratableReducer<any>).dehydrate(
          state[key]
        );
      } catch (e) {}
    }
    this.storage.setItem(this.storageKey, JSON.stringify(storedState));
  }
}
