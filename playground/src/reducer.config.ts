import {
  IReducerConfig,
  PersistentMergeableReducer,
  PersistentReduceableReducer,
} from "@tessereact/state";
import { SliceState } from "./slice.state";
import { UnmanagedReducer } from "./unmanaged.reducer";

export const reducerConfig: IReducerConfig = {
  unmanaged: new UnmanagedReducer(),
  reduceable: new PersistentReduceableReducer({
    status: "initialized",
    count: 0,
  }),
  mergeable: new PersistentMergeableReducer({
    status: "initialized",
    count: 0,
  }),
};

export enum AppStateSlices {
  UNMANAGED = "unmanaged",
  REDUCEABLE = "reduceable",
  MERGEABLE = "mergeable",
}

export interface ReduxState {
  unmanaged: SliceState;
  reduceable: SliceState;
  mergeable: SliceState;
}
