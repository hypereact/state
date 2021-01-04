import { IAction, StoreManager } from "..";

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

beforeEach(() => {
  StoreManager.dispose();
  reduceSync.mockClear();
  reduceAsync.mockClear();
});

test("sync reduce a sync dispatch of a sync json action", () => {
  StoreManager.dispose();
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
  StoreManager.dispose();
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
