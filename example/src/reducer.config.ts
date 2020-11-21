import {
  IReducerConfig,
  MergeableReducer,
  ReduceableReducer,
} from "@tesseract/state";
import { UnmanagedReducer } from "./unmanaged.reducer";

export const reducerConfig: IReducerConfig = {
  unmanaged: new UnmanagedReducer(),
  reduceable: new ReduceableReducer({ title: "hi there", count: 0 }),
  mergeable: new MergeableReducer({ title: "hi there", count: 0 }),
};

export enum AppStateSlices {
  UNMANAGED = "unmanaged",
  REDUCEABLE = "reduceable",
  MERGEABLE = "mergeable",
}
