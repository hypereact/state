import {
  IReduceableAction,
  PersistentReduceableReducer,
  ReduxAction,
  StoreManager
} from "..";

interface TestState {
  reduced: number;
}
const initialState: TestState = {
  reduced: 0,
};

const dehydrate = jest.fn().mockImplementation((state: TestState): any => {
  return state;
});

const rehydrate = jest
  .fn()
  .mockImplementation((state: TestState, data: any) => {
    return data;
  });
class ReduceableReducerOk extends PersistentReduceableReducer<TestState> {
  rehydrate(state: TestState, data: any): TestState {
    return rehydrate(state, data);
  }
  dehydrate(state: TestState): any {
    return dehydrate(state);
  }
}

const dehydrateThrow = jest.fn().mockImplementation((state: TestState): any => {
  throw new Error("fake error");
});

const rehydrateThrow = jest
  .fn()
  .mockImplementation((state: TestState, data: any) => {
    throw new Error("fake error");
  });
class ReduceableReducerThrow extends PersistentReduceableReducer<TestState> {
  rehydrate(state: TestState, data: any): TestState {
    return rehydrateThrow(state, data);
  }
  dehydrate(state: TestState): any {
    return dehydrateThrow(state);
  }
}

@ReduxAction("REDUCEABLE_ACTION_TEST", "test")
class ReduceableAction implements IReduceableAction<TestState> {
  constructor(public increment: number) {}

  reduce(state: TestState) {
    state.reduced += this.increment;
    return state;
  }
}

beforeEach(() => {
  StoreManager.dispose();
  dehydrate.mockClear();
  rehydrate.mockClear();
  dehydrateThrow.mockClear();
  rehydrateThrow.mockClear();
  localStorage.removeItem("_redux_state_");
});

test("hydratable reducer persistence methods are properly invoked", () => {
  const reducer = new ReduceableReducerOk(initialState);
  const storedState = {
    test6: {
      reduced: 7,
    },
  };
  localStorage.setItem("_redux_state_", JSON.stringify(storedState));
  expect(dehydrate).not.toHaveBeenCalled();
  expect(rehydrate).not.toHaveBeenCalled();
  const storeManager1: StoreManager = StoreManager.getInstance({
    test6: reducer,
  });
  expect(dehydrate).not.toHaveBeenCalled();
  expect(rehydrate).toHaveBeenCalledWith(initialState, storedState.test6);
  expect(storeManager1.getSlices().length).toEqual(1);
  let state6pre: TestState = storeManager1.getState("test6") as TestState;
  expect(state6pre.reduced).toEqual(7);
  window.dispatchEvent(new Event("beforeunload"));
  expect(dehydrate).toHaveBeenCalledWith(storedState.test6);
  const data = JSON.parse(localStorage.getItem("_redux_state_") || "{}");
  expect(data).toMatchObject({
    test6: {
      reduced: 7,
    },
  });
  localStorage.removeItem("_redux_state_");
  StoreManager.dispose();
  const storeManager2: StoreManager = StoreManager.getInstance({
    test6: reducer,
  });
  expect(storeManager2.getSlices().length).toEqual(1);
  let state6post: TestState = storeManager2.getState("test6") as TestState;
  expect(state6post.reduced).toEqual(7);
});

test("hydratable reducer persistence methods are properly invoked and exceptions are handled", () => {
  const reducer = new ReduceableReducerThrow(initialState);
  const storedState = {
    test7: {
      reduced: 2,
    },
  };
  localStorage.setItem("_redux_state_", JSON.stringify(storedState));
  expect(dehydrateThrow).not.toHaveBeenCalled();
  expect(rehydrateThrow).not.toHaveBeenCalled();
  const storeManager1: StoreManager = StoreManager.getInstance({
    test7: reducer,
  });
  expect(dehydrateThrow).not.toHaveBeenCalled();
  expect(rehydrateThrow).toHaveBeenCalledWith(initialState, storedState.test7);
  expect(storeManager1.getSlices().length).toEqual(1);
  let state7: TestState = storeManager1.getState("test7") as TestState;
  expect(state7.reduced).toEqual(0);
  window.dispatchEvent(new Event("beforeunload"));
  expect(dehydrateThrow).toHaveBeenCalledWith(initialState);
  const data = JSON.parse(localStorage.getItem("_redux_state_") || "{}");
  expect(data).toMatchObject({});
  StoreManager.dispose();
  const storeManager2: StoreManager = StoreManager.getInstance({
    test7: reducer,
  });
  expect(storeManager2.getSlices().length).toEqual(1);
  let state6post: TestState = storeManager2.getState("test7") as TestState;
  expect(state6post.reduced).toEqual(0);
});

test("dynamic configuration invokes hydratable reducer persistence methods", () => {
  const storeManager = StoreManager.getInstance();

  expect(dehydrate).not.toHaveBeenCalled();
  expect(rehydrate).not.toHaveBeenCalled();
  const reducer = new ReduceableReducerOk(initialState);
  storeManager.addReducer("test", reducer);
  expect(dehydrate).not.toHaveBeenCalled();
  expect(rehydrate).not.toHaveBeenCalled();

  expect(storeManager.getSlices().length).toEqual(1);
  let statepre: TestState = storeManager.getState("test") as TestState;
  expect(statepre.reduced).toEqual(0);

  storeManager.dispatch(new ReduceableAction(3));
  let statepost: TestState = storeManager.getState("test") as TestState;
  expect(statepost.reduced).toEqual(3);

  storeManager.removeReducer("test");
  expect(dehydrate).toHaveBeenCalledWith(statepost);
  expect(rehydrate).not.toHaveBeenCalled();
  dehydrate.mockClear();
  rehydrate.mockClear();
  storeManager.addReducer("test", reducer);
  expect(rehydrate).toHaveBeenCalledWith(initialState, statepost);

  let statepostpersist: TestState = storeManager.getState("test") as TestState;
  expect(statepostpersist.reduced).toEqual(3);

  storeManager.removeReducer("test");
  expect(dehydrate).toHaveBeenCalledWith(statepostpersist);
  dehydrate.mockClear();
  window.dispatchEvent(new Event("beforeunload"));
  expect(dehydrate).not.toHaveBeenCalled();
  const data = JSON.parse(localStorage.getItem("_redux_state_") || "{}");
  expect(data).toMatchObject({
    test: {
      reduced: 3,
    },
  });
  StoreManager.dispose();
  const storedState = {
    test: {
      reduced: 2,
    },
  };
  localStorage.setItem("_redux_state_", JSON.stringify(storedState));
  const storeManager2: StoreManager = StoreManager.getInstance();
  storeManager2.addReducer("test", reducer);
  expect(storeManager2.getSlices().length).toEqual(1);
  let state6post: TestState = storeManager2.getState("test") as TestState;
  expect(state6post.reduced).toEqual(2);
});

test("persisted state can be ignored and cleared", () => {
  const reducer = new ReduceableReducerOk(initialState);
  const storedState = {
    test6: {
      reduced: 0,
    },
  };
  localStorage.setItem("_redux_state_", JSON.stringify(storedState));
  expect(dehydrate).not.toHaveBeenCalled();
  expect(rehydrate).not.toHaveBeenCalled();
  const storeManager1: StoreManager = StoreManager.getInstance(
    {
      test6: reducer,
    },
    undefined,
    true
  );
  expect(dehydrate).not.toHaveBeenCalled();
  expect(rehydrate).not.toHaveBeenCalled();
  expect(storeManager1.getSlices().length).toEqual(1);
  let state6pre: TestState = storeManager1.getState("test6") as TestState;
  expect(state6pre.reduced).toEqual(0);
  storeManager1.dispatch(new ReduceableAction(7));
  storeManager1.suspendStorage();
  window.dispatchEvent(new Event("beforeunload"));
  const data = JSON.parse(localStorage.getItem("_redux_state_") || "{}");
  expect(data).toMatchObject({});
  localStorage.removeItem("_redux_state_");
  StoreManager.dispose();
  const storeManager2: StoreManager = StoreManager.getInstance({
    test6: reducer,
  });
  expect(storeManager2.getSlices().length).toEqual(1);
  let state6post: TestState = storeManager2.getState("test6") as TestState;
  expect(state6post.reduced).toEqual(0);
});
