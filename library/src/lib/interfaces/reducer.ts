import { IAction } from "./action";
import { IState } from "./state";

export interface IReducer<T> {
  reduce(state: T, action: IAction): T;
}

export type Reduce<T> = (state: T, action: IAction) => T;