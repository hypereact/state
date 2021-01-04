export interface IAction {
  type?: string;
  [props: string]: any;
}

export interface ISliceableAction<T> extends IAction {
  slice?: string;
}

export interface IReduceableAction<T> extends IAction {
  reduce(state: T): T;
}
