import { AnyAction, createStore, Store } from "redux";
import { IAction } from "../interfaces/action";
import { IConfig } from "../interfaces/config";
import { IReducer } from "../interfaces/reducer";
import { IState } from "../interfaces/state";
import { ReducerManager as ReducerManager } from "./reducer.manager";

export class StoreManager {
  private static instance: StoreManager;
  private store?: Store<any, AnyAction>;
  private manager?: ReducerManager;

  private constructor() {}

  static getInstance() {
    if (StoreManager.instance == null) {
      StoreManager.instance = new StoreManager();
    }
    return StoreManager.instance;
  }

  getStore(initialReducers?: IConfig): Store<any, AnyAction> {
    if (this.store == null) {
      this.manager = new ReducerManager(initialReducers);
      this.store = createStore(
        this.manager.reduce.bind(this.manager),
        (<any>window)?.__REDUX_DEVTOOLS_EXTENSION__?.()
      );
      this.manager.setStore(this.store);
    } else if (initialReducers != null) {
      for (let [key, value] of Object.entries(initialReducers)) {
        this.addSlice(key, value);
      }
    }
    return this.store;
  }

  getState(key?: string): IState | undefined {
    if (key) {
      return this.store?.getState()?.[key] as IState;
    } else {
      return this.store?.getState() as IState;
    }
  }

  addSlice(key: string, reducer: IReducer<any>) {
    this.manager?.addReducer(key, reducer);
  }

  removeSlice(key: string) {
    this.manager?.removeReducer(key);
  }

  getSlices(): string[] {
    return this.manager?.getReducerKeys() || [];
  }

  dispatch(action: IAction) {
    if (action.reduce != null && typeof action.reduce === "function" && !this.manager?.hasActionReducer(action.type)) {
      this.manager?.addActionReducer(action.type, action.reduce);
    }
    const pojo = JSON.parse(JSON.stringify(action));
    this.store?.dispatch(pojo);
  }

  getActionTypes(): string[] {
    return this.manager?.getActionTypes() || [];
  }
}
