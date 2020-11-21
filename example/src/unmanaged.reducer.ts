import { IReducer } from "@tesseract/state";
import { AppState } from "./app.state";

const initialState: AppState = {
  title: "Hello there!",
  count: 0,
};

export class UnmanagedReducer implements IReducer<AppState> {
  reduce(state: AppState = initialState, action: any): AppState {
    switch (action.type) {
      case "UNMANAGED_TITLE_SET":
        return { ...state, title: action.title };
        break;
      case "UNMANAGED_COUNT_SET":
        return { ...state, count: action.count };
        break;
    }
    return state;
  }
}
