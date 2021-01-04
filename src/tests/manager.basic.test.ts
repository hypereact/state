import { IAction, ReduxAction, StoreManager } from "..";

interface TestState {
  reduced: number;
}
const initialState: TestState = {
  reduced: 0,
};

enum TestActionTypes {
  REDUCE1_TEST = "REDUCE1_TEST",
  REDUCE2_TEST = "REDUCE2_TEST",
}

const reduce1 = jest.fn().mockImplementation(
  (state: TestState = initialState, action: IAction): TestState => {
    switch (action.type) {
      case TestActionTypes.REDUCE1_TEST:
        return { ...state, reduced: state.reduced + 1 };
    }
    return state;
  }
);
const MockReducer1 = jest.fn().mockImplementation(() => ({
  reduce: reduce1,
}));
const mockReducer1 = new MockReducer1();

const reduce2 = jest.fn().mockImplementation(
  (state: TestState = initialState, action: IAction): TestState => {
    switch (action.type) {
      case TestActionTypes.REDUCE2_TEST:
        return { ...state, reduced: state.reduced + 1 };
    }
    return state;
  }
);
const MockReducer2 = jest.fn().mockImplementation(() => ({
  reduce: reduce2,
}));
const mockReducer2 = new MockReducer2();

@ReduxAction(TestActionTypes.REDUCE2_TEST)
class Action2 implements IAction {}

beforeEach(() => {
  StoreManager.dispose();
  reduce1.mockClear();
  reduce2.mockClear();
});

test("create instance of store manager without reducers", () => {
  const storeManager: StoreManager = StoreManager.getInstance();
  expect(storeManager).not.toBeUndefined();
  expect(storeManager).toBeInstanceOf(StoreManager);
});

test("create instance of store with one reducer", () => {
  const storeManager: StoreManager = StoreManager.getInstance({
    test1: mockReducer1,
  });
  expect(reduce1).toHaveBeenCalled();
  expect(storeManager.getSlices().length).toEqual(1);
});

test("reduce a json dispatched action", () => {
  const storeManager: StoreManager = StoreManager.getInstance({
    test1: mockReducer1,
  });
  expect(reduce1).toHaveBeenCalled();
  reduce1.mockClear();
  storeManager.dispatch({
    type: TestActionTypes.REDUCE1_TEST,
  });
  expect(reduce1).toHaveBeenCalledTimes(1);
  let state1: TestState = storeManager.getState("test1") as TestState;
  expect(state1.reduced).toEqual(1);
  storeManager.dispatch({
    type: TestActionTypes.REDUCE1_TEST,
  });
  storeManager.dispatch(new Action2());
  expect(reduce1).toHaveBeenCalledTimes(3);
  let state2: TestState = storeManager.getState("test1") as TestState;
  expect(state2.reduced).toEqual(2);
});

test("create a store with two reducers", () => {
  const storeManager: StoreManager = StoreManager.getInstance({
    test1: mockReducer1,
    test2: mockReducer2,
  });
  let state1pre: TestState = storeManager.getState("test1") as TestState;
  expect(reduce1).toHaveBeenCalled();
  expect(reduce2).toHaveBeenCalled();
  reduce1.mockClear();
  reduce2.mockClear();
  expect(storeManager.getSlices().length).toEqual(2);
  let state1post: TestState = storeManager.getState("test1") as TestState;
  let state2pre: TestState = storeManager.getState("test2") as TestState;
  expect(state1pre.reduced).toEqual(state1post.reduced);
  expect(state2pre.reduced).toEqual(0);
  storeManager.dispatch({
    type: TestActionTypes.REDUCE2_TEST,
  });
  expect(reduce1).toHaveBeenCalledTimes(1);
  expect(reduce2).toHaveBeenCalledTimes(1);
  let state2post: TestState = storeManager.getState("test2") as TestState;
  expect(state2post.reduced).toEqual(1);
});
