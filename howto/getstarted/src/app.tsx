import { ReduxConnect, StoreManager } from "@hypereact/state";
import React from "react";
import { IncrementCountAction, SetExampleMessageAction } from "./action";
import { ExampleState, PersistedState, RootState } from "./state";

interface AppProps {
  example?: ExampleState;
  persistent?: PersistedState;
}

// decorate with the React Redux mapStateToProps function as argument
@ReduxConnect((state: RootState) => {
    return {
        ...state,
    };
})
export class App extends React.Component<AppProps> {

    private handleGreet() {
        // dispatch actions
        const storeManager = StoreManager.getInstance();
        storeManager.dispatch(new SetExampleMessageAction("John"));
        storeManager.dispatch(new IncrementCountAction());
    }

    render() {
        const count = this.props.persistent!.count;
        const message = this.props.example!.message;
        return (
            <>
                <div>Clicked {count} with lastest greeting message "{message}".</div>
                <button onClick={this.handleGreet}>Greet</button>
            </>
        );
    }
}