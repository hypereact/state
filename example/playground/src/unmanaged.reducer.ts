import { IReducer } from "@hypereact/state";
import { SliceState } from "./slice.state";

const initialState: SliceState = {
  status: "initialized",
  count: 0,
};

export class UnmanagedReducer implements IReducer<SliceState> {
  reduce(state: SliceState = initialState, action: any): SliceState {
    switch (action.type) {
      case "UNMANAGED_STATUS_SET":
        return { ...state, status: action.status };
        break;
      case "UNMANAGED_COUNT_SET":
        return { ...state, count: action.count };
        break;
    }
    return state;
  }
}
