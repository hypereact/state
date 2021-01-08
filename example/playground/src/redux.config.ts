import {
  IReduxConfig,
  PersistentMergeableReducer,
  PersistentReduceableReducer,
} from "@hypereact/state";
import { LazyPersistentReduceableReducer } from "./lazy.persisted.reducer";
import { SliceState } from "./slice.state";
import { UnmanagedReducer } from "./unmanaged.reducer";

export const reducerConfig: IReduxConfig = {
  unmanaged: new UnmanagedReducer(),
  reduceable: new PersistentReduceableReducer({
    status: "initialized",
    count: 0,
  }),
  mergeable: new PersistentMergeableReducer({
    status: "initialized",
    count: 0,
  }),
  lazy: new LazyPersistentReduceableReducer({
    status: "initialized",
    count: 0,
  }),
};

export enum AppStateSlices {
  UNMANAGED = "unmanaged",
  REDUCEABLE = "reduceable",
  MERGEABLE = "mergeable",
  LAZYHYDRATED = "lazy",
}

export interface ReduxState {
  unmanaged: SliceState;
  reduceable: SliceState;
  mergeable: SliceState;
  lazy: SliceState;
}
