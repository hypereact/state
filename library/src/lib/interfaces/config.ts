import { IReducer } from "./reducer";

export interface IConfig {
  [slice: string]: IReducer<any>;
}
