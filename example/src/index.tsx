import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import {
  Action,
  ReduceableAction,
  ReduceableReducer,
  StoreManager,
} from "@novetica/tesseract-state";

interface AppState {
  title: string;
}

@Action("APP_TITLE_SET", "app2")
class AppTitleSetAction1 extends ReduceableAction<AppState> {
  title = "test";

  reduce(state: AppState, action: AppTitleSetAction1) {
    state.title = this.title;
    return state;
  }
}

@Action("APP_TITLE_SET", "app1")
class AppTitleSetAction2 extends ReduceableAction<AppState> {
  title = "yettt";

  reduce(state: AppState, action: AppTitleSetAction2) {
    state.title = this.title;
    return state;
  }
}

(async () => {
  const storeManager = new StoreManager({
    app1: new ReduceableReducer({ title: "hi there" }),
  });
  ReactDOM.render(
    <Provider store={storeManager.getStore()}>
      <div onClick={() => storeManager.dispatch(new AppTitleSetAction2())}>
        Hi there!
      </div>
    </Provider>,
    document.getElementById("root")
  );
  storeManager.addReducer("app2", new ReduceableReducer({ title: "hi there" }));
  storeManager.dispatch(new AppTitleSetAction1())
})();