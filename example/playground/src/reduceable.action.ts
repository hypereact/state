import { IReduceableAction, ReduxAction } from "@hypereact/state";
import { AppStateSlices } from "./redux.config";
import { SliceState } from "./slice.state";

@ReduxAction(
  "REDUCEABLE_STATUS_SET_AND_COUNT_INCREMENT",
  AppStateSlices.REDUCEABLE
)
export class ReduceableSetIncrementAction
  implements IReduceableAction<SliceState> {
  constructor(public status: string, public increment: number) {}

  reduce(state: SliceState) {
    state.status = this.status;
    state.count += this.increment;
    return state;
  }
}

@ReduxAction("LAZY_STATUS_SET_AND_COUNT_INCREMENT", AppStateSlices.LAZYHYDRATED)
export class LazyHydratedSetIncrementAction
  implements IReduceableAction<SliceState> {
  constructor(public status: string, public increment: number) {}

  reduce(state: SliceState) {
    state.status = this.status;
    state.count += this.increment;
    return state;
  }
}
