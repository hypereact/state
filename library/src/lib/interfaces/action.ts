export interface IAction {
  type: string;
  [props: string]: any;
}

export interface IReduceableAction<T> extends IAction {
  reduce(state: T, action: IAction): T;
}