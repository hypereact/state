import { ReduxConnect, StoreManager } from "@hypereact/state";
import React from "react";
import { MergeableStatusAndOtherSetAction } from "./mergeable.action";
import {
  LazyHydratedSetIncrementAction,
  ReduceableSetIncrementAction
} from "./reduceable.action";
import { AppStateSlices, ReduxState } from "./redux.config";
import { SliceState } from "./slice.state";
import { UnmanagedStatusSetAction } from "./unmanaged.action";

// define interface for component props
interface AppProps {
  unmanaged?: SliceState;
  reduceable?: SliceState;
  mergeable?: SliceState;
  lazy?: SliceState;
}

// decorate with the react-redux mapStateToProps as argument
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

  private handleUnmanagedCountClick() {
    const currentState: SliceState = this.storeManager.getState(
      AppStateSlices.UNMANAGED
    );
    this.storeManager.dispatch({
      type: "UNMANAGED_COUNT_SET",
      count: currentState.count + 1,
    });
    console.log(this.storeManager.getState());
  }

  private handleMergeableStatusClick() {
    this.storeManager.dispatch(
      new MergeableStatusAndOtherSetAction("dispatched", false)
    );
    console.log(this.storeManager.getState());
  }

  private handleReduceableClick(increment: number) {
    this.storeManager.dispatch(
      new ReduceableSetIncrementAction("dispatched", increment)
    );
    console.log(this.storeManager.getState());
  }

  private handleLazyHydratedClick(increment: number) {
    this.storeManager.dispatch(
      new LazyHydratedSetIncrementAction("dispatched", increment)
    );
    console.log(this.storeManager.getState());
  }

  private handleLoopActions() {
    setInterval(() => {
      this.storeManager.dispatch({
        type: "UNMANAGED_COUNT_SET",
        count: this.storeManager.getState(AppStateSlices.UNMANAGED).count + 1,
      });
      this.storeManager.dispatch(
        new MergeableStatusAndOtherSetAction("dispatched", false)
      );
      this.storeManager.dispatch(
        new ReduceableSetIncrementAction("dispatched", 1)
      );
      this.storeManager.dispatch(
        new LazyHydratedSetIncrementAction("dispatched", 1)
      );
    }, 1000);
  }

  private handleClearPersistence() {
    this.storeManager.suspendStorage();
  }

  render() {
    return (
      <>
        <div>Slices: {this.storeManager.getSlices().join(", ")}</div>
        <br />
        <table>
          <thead>
            <tr>
              <th>Slice</th>
              <th>Ready</th>
              <th>State (.status)</th>
              <th>State (.count)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>unmanaged</td>
              <td>
                {String(this.storeManager.isReady(AppStateSlices.UNMANAGED))}
              </td>
              <td>{this.props.unmanaged?.status}</td>
              <td>{this.props.unmanaged?.count}</td>
              <td>
                <button onClick={() => this.handleUnmanagedStatusClick()}>
                  Set Status
                </button>
                <button onClick={() => this.handleUnmanagedCountClick()}>
                  Increment Count By
                </button>
              </td>
            </tr>
            <tr>
              <td>mergeable</td>
              <td>
                {String(this.storeManager.isReady(AppStateSlices.MERGEABLE))}
              </td>
              <td>{this.props.mergeable?.status}</td>
              <td>{this.props.mergeable?.count}</td>
              <td>
                <button onClick={() => this.handleMergeableStatusClick()}>
                  Set Status And Increment Count
                </button>
              </td>
            </tr>
            <tr>
              <td>reduceable</td>
              <td>
                {String(this.storeManager.isReady(AppStateSlices.REDUCEABLE))}
              </td>
              <td>{this.props.reduceable?.status}</td>
              <td>{this.props.reduceable?.count}</td>
              <td>
                <button onClick={() => this.handleReduceableClick(1)}>
                  Set Status And Increment Count By
                </button>
              </td>
            </tr>
            <tr>
              <td>lazy rehydrated</td>
              <td>
                {String(this.storeManager.isReady(AppStateSlices.LAZYHYDRATED))}
              </td>
              <td>{this.props.lazy?.status}</td>
              <td>{this.props.lazy?.count}</td>
              <td>
                <button onClick={() => this.handleLazyHydratedClick(1)}>
                  Set Status And Increment Count By
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <br />
        <button onClick={() => this.handleLoopActions()}>Loop actions</button>
        <button onClick={() => this.handleClearPersistence()}>
          Clear persistence
        </button>
      </>
    );
  }
}
