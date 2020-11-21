import { IReduceableAction, ReduxAction } from "@tesseract/state";
import { AppState } from "./app.state";
import { AppStateSlices } from "./reducer.config";

@ReduxAction(
  "REDUCEABLE_TITLE_SET_AND_COUNT_INCREMENT",
  AppStateSlices.REDUCEABLE
)
export class ReduceableSetIncrementAction
  implements IReduceableAction<AppState> {
  constructor(public title: string, public increment: number) {}

  reduce(state: AppState, action: ReduceableSetIncrementAction) {
    state.title = this.title;
    state.count += this.increment;
    return state;
  }
}
