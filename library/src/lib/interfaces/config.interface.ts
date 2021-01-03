import { IReducer } from "./reducer.interface";

export interface IReducerConfig {
  [slice: string]: IReducer<any>;
}
