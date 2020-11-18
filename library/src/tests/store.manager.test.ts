import {
  Action,
  IAction,
  IReduceableAction,
  ReduceableAction,
  ReduceableReducer,
  StoreManager,
} from "..";

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
class ReduceableAction3<TestState> implements IReduceableAction<TestState> {
  type = "REDUCEABLE_ACTION_TEST";
  slice = "test3";

  constructor(public increment: number) {}

  reduce(state: TestState | any, action: ReduceableAction3<TestState>) {
    state.reduced += this.increment;
    return state;
  }
}
@Action("REDUCEABLE_ACTION_TEST", "test4")
class ReduceableAction4<TestState> extends ReduceableAction<TestState> {
  constructor(public increment: number) {
    super();
  }

  reduce(state: TestState | any, action: ReduceableAction4<TestState>) {
    state.reduced += this.increment;
    return state;
  }
}

beforeEach(() => {
  reduce1.mockClear();
  reduce2.mockClear();
});

test("create instance of store manager without reducers", () => {
  const storeManager: StoreManager = new StoreManager();
  expect(storeManager).not.toBeUndefined();
  expect(storeManager).toBeInstanceOf(StoreManager);
});

test("initialize store with one reducer", () => {
  const storeManager: StoreManager = new StoreManager({
    test1: mockReducer1,
  });
  expect(reduce1).toHaveBeenCalled();
  expect(storeManager.getSlices().length).toEqual(1);
});

test("reduce a json dispatched action", () => {
  const storeManager: StoreManager = new StoreManager({
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
  storeManager.dispatch({
    type: TestActionTypes.REDUCE2_TEST,
  });
  expect(reduce1).toHaveBeenCalledTimes(3);
  let state2: TestState = storeManager.getState("test1") as TestState;
  expect(state2.reduced).toEqual(2);
});

test("extend an existing store with new reducers", () => {
  const storeManager: StoreManager = new StoreManager({
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

test("dispatch with reduce-able action", () => {
  const storeManager: StoreManager = new StoreManager({
    test1: mockReducer1,
    test2: mockReducer2,
    test3: new ReduceableReducer<TestState>(initialState),
  });
  expect(reduce1).toHaveBeenCalled();
  expect(reduce2).toHaveBeenCalled();
  expect(storeManager.getSlices().length).toEqual(3);
  let state3pre: TestState = storeManager.getState("test3") as TestState;
  expect(state3pre.reduced).toEqual(0);
  expect(storeManager.getReduceableActionTypes().length).toEqual(0);
  storeManager.dispatch(new ReduceableAction3(2));
  expect(storeManager.getReduceableActionTypes().length).toEqual(1);
  let state3post: TestState = storeManager.getState("test3") as TestState;
  expect(state3post.reduced).toEqual(2);
});

test("dispatch with two reduce-able action", () => {
  const storeManager: StoreManager = new StoreManager({
    test1: mockReducer1,
    test2: mockReducer2,
    test3: new ReduceableReducer<TestState>(initialState),
    test4: new ReduceableReducer<TestState>(initialState),
  });
  expect(reduce1).toHaveBeenCalled();
  expect(reduce2).toHaveBeenCalled();
  expect(storeManager.getSlices().length).toEqual(4);
  let state3pre: TestState = storeManager.getState("test3") as TestState;
  expect(state3pre.reduced).toEqual(0);
  let state4pre: TestState = storeManager.getState("test3") as TestState;
  expect(state4pre.reduced).toEqual(0);
  expect(storeManager.getReduceableActionTypes().length).toEqual(0);
  storeManager.dispatch(new ReduceableAction3(2));
  expect(storeManager.getReduceableActionTypes().length).toEqual(1);
  storeManager.dispatch(new ReduceableAction4(2));
  expect(storeManager.getReduceableActionTypes().length).toEqual(2);
  let state3post: TestState = storeManager.getState("test3") as TestState;
  expect(state3post.reduced).toEqual(2);
  let state4post: TestState = storeManager.getState("test4") as TestState;
  expect(state4post.reduced).toEqual(2);
});
