// the state slice names as enum elements
export enum Slices {
  Example = "example",
  Persisted = "persistent",
}

//  the example state will just provide basic
export interface ExampleState {
  message: string; // will store a message to be shown
}
// the persistent state will be made persistent against the reload of application
export interface PersistedState {
  count: number; // will store an incrementable count
}

// root state interface representation of slices
export interface RootState {
  example: ExampleState;
  persistent: PersistedState;
}

// object for initialization of redux state slices
export const initialExampleState: ExampleState = {
  message: "n.d.",
};
export const initialPersistedState: PersistedState = {
  count: 0,
};
