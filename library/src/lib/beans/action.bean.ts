import { IAction, IReduceableAction } from "../interfaces/action.interface";

export class Action implements IAction {
  type!: string;
}

export class ReduceableAction<T> implements IReduceableAction<T> {
  slice!: string;
  type!: string;

  reduce(state: T, action: IAction): T {
    throw new Error("method not implemented");
  }
}
