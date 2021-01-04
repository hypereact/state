import { IReducer } from "./reducer.interface";

export interface IReduxConfig {
  [slice: string]: IReducer<any>;
}
