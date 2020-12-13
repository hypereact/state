import { IReduceableAction, ReduxAction } from "@tessereact/state";
import { ExampleState, PersistedState, Slices } from "./state";

@ReduxAction("SET_EXAMPLE_MESSAGE", Slices.Example)
export class SetExampleMessageAction
  implements IReduceableAction<ExampleState> {
  constructor(public name: string) {}

  reduce(state: ExampleState) {
    state.message = `Hello ${this.name}`;
    return state;
  }
}

@ReduxAction("INCREMENT_PERSISTENT_COUNT", Slices.Persisted)
export class IncrementCountAction implements IReduceableAction<PersistedState> {
  constructor(public incrementBy: number = 1) {}

  reduce(state: PersistedState) {
    state.count += this.incrementBy;
    return state;
  }
}
