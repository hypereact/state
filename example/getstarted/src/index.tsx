import {
  IReduxConfig,
  PersistentReduceableReducer, ReduceableReducer,
  StoreManager
} from "@hypereact/state";
import React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { App } from "./app";
import { initialExampleState, initialPersistedState } from "./state";


export const reduxConfig: IReduxConfig = {
  example: new ReduceableReducer(initialExampleState),
  persistent: new PersistentReduceableReducer(initialPersistedState)
}

// initialize the singleton instance of StoreManager passing the configuration
// thus you can always get it in your code through StoreManager.getInstance() static function
const storeManager = StoreManager.getInstance(reduxConfig);

// render Provider with store prop as usual
ReactDOM.render(
  <Provider store={StoreManager.getInstance().getStore()}>
    <App />
  </Provider>,
  document.getElementById("root")
);