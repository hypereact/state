import { StoreManager } from "@tesseract/state";
import React from "react";
import { AppState } from "./app.state";
import { MergeableTitleAndOtherSetAction } from "./mergeable.action";
import { ReduceableSetIncrementAction } from "./reduceable.action";
import { AppStateSlices } from "./reducer.config";
import { UnmanagedTitleSetAction } from "./unmanaged.action";

export class App extends React.Component {
  // get the store manager instance created initially
  private storeManager: StoreManager = StoreManager.getInstance();

  private handleUnmanagedTitleClick() {
    const action: UnmanagedTitleSetAction = {
      type: "UNMANAGED_TITLE_SET",
      title: "dispatched",
    };
    this.storeManager.dispatch(action);
    console.log(this.storeManager.getState());
  }

  private handleUnmanagedCountClick(increment: number) {
    const currentState: AppState = this.storeManager.getState(
      AppStateSlices.UNMANAGED
    );
    this.storeManager.dispatch({
      type: "UNMANAGED_COUNT_SET",
      count: currentState.count + increment,
    });
    console.log(this.storeManager.getState());
  }

  private handleMergeableTitleClick() {
    this.storeManager.dispatch(
      new MergeableTitleAndOtherSetAction("dispatched", false)
    );
    console.log(this.storeManager.getState());
  }

  private handleReducleableClick(increment: number) {
    this.storeManager.dispatch(
      new ReduceableSetIncrementAction("dispatched", increment)
    );
    console.log(this.storeManager.getState());
  }

  render() {
    console.log(this.storeManager.getSlices());
    return (
      <>
        <div>Slices: this.storeManager.getSlices()</div>
        <br />
        <table>
          <thead>
            <tr>
              <th>Slice</th>
              <th>State (.title)</th>
              <th>State (.count)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>unmanaged</td>
              <td></td>
              <td></td>
              <td>
                <button onClick={() => this.handleUnmanagedTitleClick()}>
                  Set Title
                </button>
                <button onClick={() => this.handleUnmanagedCountClick(2)}>
                  Increment Count By
                </button>
              </td>
            </tr>
            <tr>
              <td>mergeable</td>
              <td></td>
              <td></td>
              <td>
                <button onClick={() => this.handleMergeableTitleClick()}>
                  Set Title
                </button>
              </td>
            </tr>
            <tr>
              <td>reduceable</td>
              <td></td>
              <td></td>
              <td>
                <button onClick={() => this.handleReducleableClick(2)}>
                  Set Title And Increment Count By
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );
  }
}
