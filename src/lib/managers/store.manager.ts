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
  private ready: boolean = false;

  public static getInstance(
    reducers?: IReduxConfig,
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
      for (const key of instance.reducers.keys()) {
        if (!config.has(key)) {
          instance.removeReducer(key);
        }
      }
      for (const [key, value] of config.entries()) {
        if (!instance.reducers.has(key)) {
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

  isInitialized(): boolean {
    return this.ready;
  }

  public getSlices(): string[] {
    return [...this.reducers.keys()];
  }

  public getState(key?: string): any | undefined {
    if (key) {
      return this.store?.getState()?.[key];
    } else {
      return this.store?.getState();
    }
  }

  public dispatch(action: any | Promise<any>): void | Promise<void> {
    if (action instanceof Promise) {
      return this.dispatchAsync(action);
    } else {
      this.dispatchSync(action);
    }
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
      if (action.type != null && !reducer?.actions.has(action.type)) {
        reducer?.actions.set(action.type, action.reduce);
      }
    }
    const pojo = JSON.parse(JSON.stringify(action));
    this.store?.dispatch(pojo);
  }

  private reduce(state: any, action: IAction) {
    const nextState: any = JSON.parse(JSON.stringify(state || {}));
    if (InterfaceUtil.isSliceAction(action)) {
      const slice: string = (action as ISliceableAction<any>).slice!;
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
    if (!this.ready) {
      this.ready = true;
    }
    return nextState;
  }

  private reduceSlice(
    nextState: any,
    slice: string,
    reducer: IReducer<any>,
    action: IAction
  ): void {
    nextState[slice] = reducer.reduce(nextState[slice], action);
    if (InterfaceUtil.isHydratableReducer(reducer)) {
      if (this.storageState[slice] != null) {
        try {
          nextState[slice] = (reducer as IHydratableReducer<any>).rehydrate(
            nextState[slice],
            this.storageState[slice]
          );
          delete this.storageState[slice];
        } catch (e) {}
      }
    }
  }

  public addReducer(slice: string, reducer: IReducer<any>) {
    //TODO support reducer replace
    const isReplaced: boolean = this.reducers.has(slice);
    if (isReplaced) {
      return;
    }
    this.reducers.set(slice, reducer);
    this.ready = false;
    this.store?.dispatch({
      type: isReplaced ? "@@REDUCER_REPLACE" : "@@REDUCER_ADD",
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
