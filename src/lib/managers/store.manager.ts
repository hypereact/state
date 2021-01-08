import { AnyAction, createStore, Store } from "redux";
import { IAction, ISliceableAction } from "../interfaces/action.interface";
import { IReduxConfig } from "../interfaces/config.interface";
import { IHydratableReducer, IReducer } from "../interfaces/reducer.interface";
import { ReduceableReducer } from "../reducers/reduceable.reducer";
import { InterfaceUtil } from "../utils/interface.util";

export class StoreManager {
  private static instance?: StoreManager;

  private store!: Store<any, AnyAction>;

  private storage: Storage = localStorage;
  private storageKey: string = "_redux_state_";
  private storageState: any = {};
  private beforeUnloadListener?: (ev: BeforeUnloadEvent) => any = undefined;

  private reducers: Map<string, IReducer<any>> = new Map();

  private readyMap: Map<string, Promise<any>> = new Map();

  public static getInstance(
    config?: IReduxConfig,
    storage?: Storage
  ): StoreManager {
    let reducers: Map<string, IReducer<any>> = StoreManager.__normalizeConfig(
      config
    );

    let instance = StoreManager.instance;
    if (instance == null) {
      instance = StoreManager.instance = new StoreManager(
        reducers.entries(),
        storage
      );
    } else if (config != null) {
      StoreManager.instance!.__reconfigure(reducers);
    }

    return instance;
  }

  private static __normalizeConfig(
    config: IReduxConfig = {}
  ): Map<string, IReducer<any>> {
    let reducers: Map<string, IReducer<any>>;
    if (config instanceof Map) {
      reducers = config;
    } else {
      reducers = new Map();
      for (const [key, value] of Object.entries(config)) {
        reducers.set(key, value);
      }
    }
    return reducers;
  }

  private __reconfigure(config: Map<string, IReducer<any>>) {
    for (const key of this.reducers.keys()) {
      if (!config.has(key)) {
        this.removeReducer(key);
      }
    }
    for (const [key, value] of config.entries()) {
      if (!this.reducers.has(key)) {
        this.addReducer(key, value);
      }
    }
  }

  public static dispose() {
    if (StoreManager.instance != null) {
      StoreManager.instance.__dispose();
    }
    StoreManager.instance = undefined;
  }

  private __dispose() {
    if (this.beforeUnloadListener != null) {
      window.removeEventListener("beforeunload", this.beforeUnloadListener);
      this.beforeUnloadListener = undefined;
    }
    this.dehydrate();
  }

  constructor(
    entries: IterableIterator<[any, IReducer<any>]>,
    storage?: Storage
  ) {
    this.storage = storage || this.storage;
    let persistedState: any = this.storage.getItem(this.storageKey);
    if (persistedState != null) {
      this.storageState = JSON.parse(persistedState);
      this.storage.removeItem(this.storageKey);
    }

    for (const [key, value] of entries) {
      this.addReducer(key, value);
    }

    this.store = createStore(
      this.reduce.bind(this),
      (<any>window)?.__REDUX_DEVTOOLS_EXTENSION__?.()
    );

    this.beforeUnloadListener = this.handleBeforeUnload.bind(this);
    window.addEventListener("beforeunload", this.beforeUnloadListener);
  }

  public getStore(): Store<any, AnyAction> {
    return this.store;
  }

  public isReady(slice?: string): boolean {
    return slice ? !this.readyMap.has(slice) : this.readyMap.size === 0;
  }

  public async waitUntilReady(slice?: string): Promise<void> {
    if (slice) {
      if (this.readyMap.has(slice)) {
        await this.readyMap.get(slice);
      }
    } else {
      await Promise.all(this.readyMap.values());
    }
  }

  public getSlices(): string[] {
    return [...this.reducers.keys()];
  }

  public getState(key?: string): any | undefined {
    return key ? this.store?.getState()?.[key] : this.store?.getState();
  }

  public dispatch(action: any | Promise<any>): void | Promise<void> {
    return action instanceof Promise
      ? this.dispatchAsync(action)
      : this.dispatchSync(action);
  }

  private async dispatchAsync(actionPromise: Promise<any>): Promise<void> {
    const action: any = await actionPromise;
    this.dispatchSync(action);
  }

  private dispatchSync(action: any): void {
    if (InterfaceUtil.isReduceableAction(action)) {
      if (!this.reducers.has(action.slice)) {
        this.addReducer(action.slice, new ReduceableReducer<any>({}));
      }
      const reducer: ReduceableReducer<any> = this.reducers.get(
        action.slice
      ) as ReduceableReducer<any>;
      if (!reducer?.actions.has(action.type)) {
        reducer?.actions.set(action.type, action.reduce);
      }
    }
    const pojo = JSON.parse(JSON.stringify(action));
    this.store?.dispatch(pojo);
  }

  private reduce(state: any, action: IAction) {
    const nextState: any = JSON.parse(JSON.stringify(state || {}));
    if (action.type?.startsWith("...")) {
      nextState[action.slice] = action.state;
      return nextState;
    }
    if (InterfaceUtil.isSliceAction(action)) {
      const slice: string = (action as ISliceableAction).slice!;
      const reducer: IReducer<any> | undefined = this.reducers.get(slice);
      if (reducer != null) {
        this.reduceSlice(nextState, slice, reducer, action);
      } else {
        delete nextState[slice];
      }
    } else {
      for (const [slice, reducer] of this.reducers) {
        this.reduceSlice(nextState, slice, reducer, action);
      }
    }
    return nextState;
  }

  private reduceSlice(
    nextState: any,
    slice: string,
    reducer: IReducer<any>,
    action: ISliceableAction
  ): void {
    nextState[slice] = reducer.reduce(nextState[slice], action);
    if (
      InterfaceUtil.isHydratableReducer(reducer) &&
      this.storageState[slice] != null
    ) {
      try {
        const rehydrationResult = (reducer as IHydratableReducer<any>).rehydrate(
          JSON.parse(JSON.stringify(nextState[slice])),
          this.storageState[slice]
        );
        if (rehydrationResult instanceof Promise) {
          this.lazyRehydrate(rehydrationResult, action.type!, slice);
        } else {
          nextState[slice] = rehydrationResult;
        }
        delete this.storageState[slice];
      } catch (e) {}
    }
  }

  private lazyRehydrate(promise: Promise<any>, type: string, slice: string) {
    const readyPromise = new Promise((resolve, reject) => {
      promise
        .then((futureStateSlice) => {
          this.readyMap.delete(slice);
          this.dispatchSync({
            type: `...${type}`,
            slice,
            state: futureStateSlice,
          });
          resolve(futureStateSlice);
        })
        .catch((error) => {
          this.readyMap.delete(slice);
          resolve(error);
        });
    });
    this.readyMap.set(slice, readyPromise);
  }

  public addReducer(slice: string, reducer: IReducer<any>) {
    if (this.reducers.has(slice)) {
      return;
    }
    this.reducers.set(slice, reducer);
    this.store?.dispatch({
      type: "@@REDUCER_ADD",
      key: slice,
    });
  }

  public removeReducer(slice: string) {
    const reducer: IReducer<any> | undefined = this.reducers.get(slice);
    if (reducer == null) {
      return;
    }
    if (InterfaceUtil.isHydratableReducer(reducer)) {
      this.storageState[slice] = (reducer as IHydratableReducer<any>).dehydrate(
        this.getState(slice)
      );
    }
    this.reducers.delete(slice);
    this.store?.dispatch({ type: "@@REDUCER_REMOVE", slice });
  }

  private handleBeforeUnload(ev: BeforeUnloadEvent) {
    delete ev["returnValue"];
    this.dehydrate();
  }

  private dehydrate() {
    if (this.storage.getItem(this.storageKey) != null) {
      this.storage.removeItem(this.storageKey);
      return;
    }
    const state = this.getState();
    for (const [slice, reducer] of this.reducers) {
      if (InterfaceUtil.isHydratableReducer(reducer)) {
        try {
          this.storageState[
            slice
          ] = (reducer as IHydratableReducer<any>).dehydrate(state[slice]);
        } catch (e) {}
      }
    }
    this.storage.setItem(this.storageKey, JSON.stringify(this.storageState));
  }
}
