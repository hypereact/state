import {
  ReduxAction,
  MergeableReducer,
  ReduceableReducer,
  StoreManager,
  IReducer,
  IAction,
  IReduceableAction,
} from "@novetica/tesseract-state";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";

interface AppState {
  title: string;
}

@ReduxAction("APP1_TITLE_SET", "app1")
class AppTitleSetAction1 implements IReduceableAction<AppState>{
  title = "test1";

  reduce(state: AppState, action: AppTitleSetAction1) {
    state.title = this.title;
    return state;
  }
}

@ReduxAction("APP2_TITLE_SET", "app2")
class AppTitleSetAction2 implements IReduceableAction<AppState> {
  title = "test2";

  reduce(state: AppState, action: AppTitleSetAction2) {
    state.title = action.title;
    return state;
  }
}

@ReduxAction("APP3_TITLE_SET")
class App3TitleSetAction implements IAction {
  title: string;
  constructor(title: string) {
    this.title = title;
  }
}
class App3Reducer implements IReducer<AppState> {
  reduce(state: AppState = { title: "hi there" }, action: any): AppState {
    switch (action.type) {
      case "APP3_TITLE_SET":
        return { ...state, title: action.title };
    }
    return state;
  }
  
}
@ReduxAction("APP5_TITLE_SET", "app5")
class App5TitleSetAction implements IAction {
  title: string;
  constructor(title: string) {
    this.title = title;
  }
}

(async () => {
  const storeManager = new StoreManager({
    app1: new ReduceableReducer({ title: "hi there" }),
    app3: new App3Reducer(),
    app5: new MergeableReducer({ title: "hi there"})
  });
  ReactDOM.render(
    <Provider store={storeManager.getStore()}>
      <div onClick={() => {
        storeManager.dispatch(new AppTitleSetAction2());
        storeManager.dispatch(new App3TitleSetAction("test3"));
        storeManager.dispatch(new App5TitleSetAction("test5"));
        storeManager.removeReducer("app5");
        storeManager.dispatch(new App5TitleSetAction("test5"));
      }}>
        Hi there!
      </div>
    </Provider>,
    document.getElementById("root")
  );
  storeManager.addReducer("app2", new ReduceableReducer({ title: "hi there" }));
  storeManager.dispatch(new AppTitleSetAction1());
})();
