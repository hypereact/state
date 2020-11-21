import { IMergeableAction, ReduxAction } from "@tesseract/state";
import { AppStateSlices } from "./reducer.config";
import { SliceState } from "./slice.state";

@ReduxAction("MERGEABLE_STATUS_SET", AppStateSlices.MERGEABLE)
export class MergeableStatusAndOtherSetAction
  implements IMergeableAction<SliceState> {
  constructor(public status: string, public clicked: boolean) {}
}
