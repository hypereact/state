import { IMergeableAction, ReduxAction } from "@tesseract/state";
import { AppState } from "./app.state";
import { AppStateSlices } from "./reducer.config";

@ReduxAction("MERGEABLE_TITLE_SET", AppStateSlices.MERGEABLE)
export class MergeableTitleAndOtherSetAction
  implements IMergeableAction<AppState> {
  constructor(public title: string, public clicked: boolean) {}
}
