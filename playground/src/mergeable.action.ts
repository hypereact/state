import { IMergeableAction, ReduxAction, StoreManager } from "@hypereact/state";
import { AppStateSlices } from "./reducer.config";
import { SliceState } from "./slice.state";

@ReduxAction("MERGEABLE_STATUS_SET", AppStateSlices.MERGEABLE)
export class MergeableStatusAndOtherSetAction
  implements IMergeableAction<SliceState> {
  count: number;
  constructor(public status: string, public clicked: boolean) {
    const currentState: SliceState = StoreManager.getInstance().getState(
      AppStateSlices.MERGEABLE
    );
    this.count = currentState.count + 1;
  }
}
