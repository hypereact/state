export interface IAction {
  //type: string;
  [props: string]: any;
}

export interface IReduceableAction<T> extends IAction {
  slice: string;
  reduce(state: T, action: IAction): T;
}
