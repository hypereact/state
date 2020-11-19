import { IAction, IReduceableAction } from "../interfaces/action.interface";

export class ReduceableAction<T> implements IReduceableAction<T> {
  slice!: string;
  type!: string;

  reduce(state: T, action: IAction): T {
    throw new Error("method not implemented");
  }
}
