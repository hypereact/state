import { StoreManager } from "@tessereact/state";
import React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { App } from "./app";
import { reducerConfig } from "./reducer.config";

(async () => {
  // get first instance of store manager while configuring initial reducers
  const storeManager: StoreManager = StoreManager.getInstance(reducerConfig);

  // render Provider with store prop as usual
  ReactDOM.render(
    <Provider store={storeManager.getStore()}>
      <App />
    </Provider>,
    document.getElementById("root")
  );
})();
