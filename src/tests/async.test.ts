import { IAction, PersistentReduceableReducer, StoreManager } from "..";

const wait = (
  ms: number,
  result: any = null,
  fail: boolean = false
): Promise<any> => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (!fail) {
        resolve(result);
      } else {
        reject(result);
      }
    }, ms);
  });
};

interface TestState {
  reduced: number;
}
const initialState: TestState = {
  reduced: 0,
};

enum TestActionTypes {
  SYNC_TEST = "REDUCE_TEST_SYNC",
  ASYNC_TEST = "REDUCE_TEST_ASYNC",
}

const reduceSync = jest.fn().mockImplementation(
  (state: TestState = initialState, action: IAction): TestState => {
    switch (action.type) {
      case TestActionTypes.SYNC_TEST:
        return { ...state, reduced: state.reduced + 1 };
    }
    return state;
  }
);
const MockReducerSync = jest.fn().mockImplementation(() => ({
  reduce: reduceSync,
}));
const mockReducerSync = new MockReducerSync();

const reduceAsync = jest.fn().mockImplementation(
  async (
    state: TestState = initialState,
    action: IAction
  ): Promise<TestState> => {
    switch (action.type) {
      case TestActionTypes.SYNC_TEST:
        return { ...state, reduced: state.reduced + 1 };
    }
    return state;
  }
);
const MockReducerAsync = jest.fn().mockImplementation(() => ({
  reduce: reduceAsync,
}));
const mockReducerAsync = new MockReducerAsync();

const rehydrate = jest.fn().mockImplementation(
  async (state: TestState, data: any): Promise<TestState> => {
    return await wait(100, data);
  }
);
class ReduceableReducerAsyncOk extends PersistentReduceableReducer<TestState> {
  async rehydrate(state: TestState, data: any): Promise<TestState> {
    return await rehydrate(state, data);
  }
}

class ReduceableReducerAsyncThrow extends PersistentReduceableReducer<TestState> {
  async rehydrate(state: TestState, data: any): Promise<TestState> {
    await rehydrate(state, data);
    throw new Error("rejected");
  }
}

beforeEach(() => {
  StoreManager.dispose();
  reduceSync.mockClear();
  reduceAsync.mockClear();
  rehydrate.mockClear();
});

test("sync reduce a sync dispatch of a sync json action", () => {
  const storeManager: StoreManager = StoreManager.getInstance({
    testSync: mockReducerSync,
  });
  expect(reduceSync).toHaveBeenCalled();
  reduceSync.mockClear();
  storeManager.dispatch({
    type: TestActionTypes.SYNC_TEST,
  });
  expect(reduceSync).toHaveBeenCalledTimes(1);
  let state1: TestState = storeManager.getState("testSync") as TestState;
  expect(state1.reduced).toEqual(1);
  storeManager.dispatch({
    type: TestActionTypes.SYNC_TEST,
  });
  expect(reduceSync).toHaveBeenCalledTimes(2);
  let state2: TestState = storeManager.getState("testSync") as TestState;
  expect(state2.reduced).toEqual(2);
});

test("sync reduce an async dispatch of an async and a sync json action", async () => {
  const storeManager: StoreManager = StoreManager.getInstance({
    testSync: mockReducerSync,
  });
  expect(reduceSync).toHaveBeenCalled();
  reduceSync.mockClear();
  await storeManager.dispatch(
    wait(100, {
      type: TestActionTypes.SYNC_TEST,
    })
  );
  expect(reduceSync).toHaveBeenCalledTimes(1);
  let state1: TestState = storeManager.getState("testSync") as TestState;
  expect(state1.reduced).toEqual(1);
  await storeManager.dispatch({
    type: TestActionTypes.SYNC_TEST,
  });
  expect(reduceSync).toHaveBeenCalledTimes(2);
  let state2: TestState = storeManager.getState("testSync") as TestState;
  expect(state2.reduced).toEqual(2);
});

test("async dispatch of an rejecting async json action", async () => {
  const storeManager: StoreManager = StoreManager.getInstance({
    testSync: mockReducerSync,
  });
  expect(reduceSync).toHaveBeenCalled();
  reduceSync.mockClear();
  await expect(
    storeManager.dispatch(wait(100, new Error("rejected"), true))
  ).rejects.toThrow("rejected");
  expect(reduceSync).not.toHaveBeenCalled();
  let state1: TestState = storeManager.getState("testSync") as TestState;
  expect(state1.reduced).toEqual(0);
});

test("hydratable reducer persistence methods are properly invoked", async () => {
  const reducer = new ReduceableReducerAsyncOk(initialState);
  const storedState = {
    test6: {
      reduced: 7,
    },
  };
  localStorage.setItem("_redux_state_", JSON.stringify(storedState));
  expect(rehydrate).not.toHaveBeenCalled();
  const storeManager1: StoreManager = StoreManager.getInstance({
    test6: reducer,
  });
  expect(rehydrate).toHaveBeenCalledWith(initialState, storedState.test6);
  const rehydratePromise = rehydrate.mock.results[0].value;
  expect(rehydratePromise).toBeInstanceOf(Promise);
  expect(storeManager1.getSlices().length).toEqual(1);
  let state6init: TestState = storeManager1.getState("test6") as TestState;
  expect(state6init.reduced).toEqual(0);
  await storeManager1.waitUntilReady();
  let state6await: TestState = storeManager1.getState("test6") as TestState;
  expect(state6await.reduced).toEqual(7);
  window.dispatchEvent(new Event("beforeunload"));
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
  await storeManager2.waitUntilReady();
  let state6post: TestState = storeManager2.getState("test6") as TestState;
  expect(state6post.reduced).toEqual(7);
});

test("hydratable reducer persistence methods are properly invoked and exceptions are handled", async () => {
  const reducer = new ReduceableReducerAsyncThrow(initialState);
  const storedState = {
    test6: {
      reduced: 7,
    },
  };
  localStorage.setItem("_redux_state_", JSON.stringify(storedState));
  expect(rehydrate).not.toHaveBeenCalled();
  const storeManager1: StoreManager = StoreManager.getInstance({
    test6: reducer,
  });
  expect(rehydrate).toHaveBeenCalledWith(initialState, storedState.test6);
  const rehydratePromise = rehydrate.mock.results[0].value;
  expect(rehydratePromise).toBeInstanceOf(Promise);
  expect(storeManager1.getSlices().length).toEqual(1);
  let state6init: TestState = storeManager1.getState("test6") as TestState;
  expect(state6init.reduced).toEqual(0);
  await storeManager1.waitUntilReady();
  let state6await: TestState = storeManager1.getState("test6") as TestState;
  expect(state6await.reduced).toEqual(0);
  window.dispatchEvent(new Event("beforeunload"));
  const data = JSON.parse(localStorage.getItem("_redux_state_") || "{}");
  expect(data).toMatchObject({
    test6: {
      reduced: 0,
    },
  });
  localStorage.removeItem("_redux_state_");
  StoreManager.dispose();
  const storeManager2: StoreManager = StoreManager.getInstance({
    test6: reducer,
  });
  expect(storeManager2.getSlices().length).toEqual(1);
  await storeManager2.waitUntilReady();
  let state6post: TestState = storeManager2.getState("test6") as TestState;
  expect(state6post.reduced).toEqual(0);
});
