import { IAction, StoreManager } from "..";

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

beforeEach(() => {
  reduce1.mockClear();
  reduce2.mockClear();
});

test("create instance of store manager without reducers", () => {
  const storeManager: StoreManager = StoreManager.getInstance();
  expect(storeManager).not.toBeUndefined();
  expect(storeManager).toBeInstanceOf(StoreManager);
});

test("reconfigure instance of store with one new reducer and dispatch an action", () => {
  const storeManager: StoreManager = StoreManager.getInstance({
    test1: mockReducer1,
  });
  expect(reduce1).toHaveBeenCalled();
  expect(storeManager.getSlices().length).toEqual(1);
  reduce1.mockClear();
  storeManager.dispatch({
    type: TestActionTypes.REDUCE1_TEST,
  });
  expect(reduce1).toHaveBeenCalledTimes(1);
  let state1: TestState = storeManager.getState("test1") as TestState;
  expect(state1.reduced).toEqual(1);
});

test("add a reducer and dispatch an action", () => {
  const storeManager: StoreManager = StoreManager.getInstance();
  expect(storeManager.getSlices().length).toEqual(1);
  let state1pre: TestState = storeManager.getState("test1") as TestState;
  expect(reduce1).not.toHaveBeenCalled();
  storeManager.addReducer("test2", mockReducer2);
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

test("remove a reducer and dispatch an action", () => {
  const storeManager: StoreManager = StoreManager.getInstance();
  expect(storeManager.getSlices().length).toEqual(2);
  let state1pre: TestState = storeManager.getState("test1") as TestState;
  storeManager.removeReducer("test2");
  expect(reduce1).toHaveBeenCalled();
  expect(storeManager.getSlices().length).toEqual(1);
  let state1post1: TestState = storeManager.getState("test1") as TestState;
  let state2pre: TestState = storeManager.getState("test2") as TestState;
  expect(state1pre.reduced).toEqual(state1post1.reduced);
  expect(state2pre).toBeUndefined();
  reduce1.mockClear();
  reduce2.mockClear();
  storeManager.dispatch({
    type: TestActionTypes.REDUCE1_TEST,
  });
  expect(reduce1).toHaveBeenCalledTimes(1);
  expect(reduce2).not.toHaveBeenCalled();
  let state1post2: TestState = storeManager.getState("test1") as TestState;
  expect(state1post2.reduced).toEqual(2);
});

test("reconfigure instance of store with one different reducer and dispatch an action", () => {
  const storeManager: StoreManager = StoreManager.getInstance({
    test2: mockReducer2,
  });
  expect(reduce1).not.toHaveBeenCalled();
  expect(reduce2).toHaveBeenCalled();
  expect(storeManager.getSlices().length).toEqual(1);
  reduce2.mockClear();
  storeManager.dispatch({
    type: TestActionTypes.REDUCE2_TEST,
  });
  expect(reduce2).toHaveBeenCalledTimes(1);
  let state2: TestState = storeManager.getState("test2") as TestState;
  expect(state2.reduced).toEqual(1);
});
