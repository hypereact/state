import { ReduxConnect, StoreManager } from "@tesseract/state";
import React from "react";
import { MergeableStatusAndOtherSetAction } from "./mergeable.action";
import { ReduceableSetIncrementAction } from "./reduceable.action";
import { AppStateSlices, ReduxState } from "./reducer.config";
import { SliceState } from "./slice.state";
import { UnmanagedStatusSetAction } from "./unmanaged.action";

interface AppProps {
  unmanaged?: SliceState;
  reduceable?: SliceState;
  mergeable?: SliceState;
}

@ReduxConnect((state: ReduxState) => {
  return {
    ...state,
  };
})
export class App extends React.Component<AppProps> {
  // get the store manager instance created initially
  private storeManager: StoreManager = StoreManager.getInstance();

  private handleUnmanagedStatusClick() {
    const action: UnmanagedStatusSetAction = {
      type: "UNMANAGED_STATUS_SET",
      status: "dispatched",
    };
    this.storeManager.dispatch(action);
    console.log(this.storeManager.getState());
  }

  private handleUnmanagedCountClick(increment: number) {
    const currentState: SliceState = this.storeManager.getState(
      AppStateSlices.UNMANAGED
    );
    this.storeManager.dispatch({
      type: "UNMANAGED_COUNT_SET",
      count: currentState.count + increment,
    });
    console.log(this.storeManager.getState());
  }

  private handleMergeableStatusClick() {
    this.storeManager.dispatch(
      new MergeableStatusAndOtherSetAction("dispatched", false)
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
              <th>State (.status)</th>
              <th>State (.count)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>unmanaged</td>
              <td>{this.props.unmanaged?.status}</td>
              <td>{this.props.unmanaged?.count}</td>
              <td>
                <button onClick={() => this.handleUnmanagedStatusClick()}>
                  Set Status
                </button>
                <button onClick={() => this.handleUnmanagedCountClick(2)}>
                  Increment Count By
                </button>
              </td>
            </tr>
            <tr>
              <td>mergeable</td>
              <td>{this.props.mergeable?.status}</td>
              <td>{this.props.mergeable?.count}</td>
              <td>
                <button onClick={() => this.handleMergeableStatusClick()}>
                  Set Status
                </button>
              </td>
            </tr>
            <tr>
              <td>reduceable</td>
              <td>{this.props.reduceable?.status}</td>
              <td>{this.props.reduceable?.count}</td>
              <td>
                <button onClick={() => this.handleReducleableClick(2)}>
                  Set Status And Increment Count By
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );
  }
}
