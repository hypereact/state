import { IReducer } from "./reducer.interface";

export interface IConfig {
  [slice: string]: IReducer<any>;
}
