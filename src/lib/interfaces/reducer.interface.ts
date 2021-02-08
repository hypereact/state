import { IAction } from "./action.interface";

export interface IReducer<T> {
  reduce(state: T, action: IAction): T;
}

export type Reduce<T> = (state: T, action: IAction) => T;

export interface IHydratableReducer<T> extends IReducer<T> {
  rehydrate(state: T, data: any, root: any): T | Promise<T>;
  dehydrate(state: T): any;
}
