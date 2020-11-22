import { StoreManager } from "../managers/store.manager";
import { IAction } from "./action.interface";

export interface IReducer<T> {
  reduce(state: T, action: IAction): T;
}

export type Reduce<T> = (state: T, action: IAction) => T;

export interface ISliceReducer<T> extends IReducer<T> {
  _initialize(slice: string, manager: StoreManager): void;
}

export interface IHydratableReducer<T> extends ISliceReducer<T> {
  rehydrate(state: T, data: any): T;
  dehydrate(state: T): any;
}
