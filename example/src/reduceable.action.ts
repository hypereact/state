import { IReduceableAction, ReduxAction } from "@tesseract/state";
import { AppStateSlices } from "./reducer.config";
import { SliceState } from "./slice.state";

@ReduxAction(
  "REDUCEABLE_STATUS_SET_AND_COUNT_INCREMENT",
  AppStateSlices.REDUCEABLE
)
export class ReduceableSetIncrementAction
  implements IReduceableAction<SliceState> {
  constructor(public status: string, public increment: number) {}

  reduce(state: SliceState, action: ReduceableSetIncrementAction) {
    state.status = this.status;
    state.count += this.increment;
    return state;
  }
}
