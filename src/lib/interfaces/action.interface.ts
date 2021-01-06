export interface IAction {
  type: string;
  [props: string]: any;
}

export interface ISliceableAction extends IAction {
  slice?: string;
}

export interface IReduceableAction<T> extends IAction {
  reduce(state: T): T;
}
