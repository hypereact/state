import {
  IReduceableAction,
  MergeableReducer,
  ReduceableReducer,
  ReduxAction,
  StoreManager,
} from "..";

interface TestState {
  reduced: number;
}
const initialState: TestState = {
  reduced: 0,
};

class ReduceableAction3 implements IReduceableAction<TestState> {
  type = "REDUCEABLE_ACTION_TEST";
  slice = "test3";

  constructor(public increment: number) {}

  reduce(state: TestState) {
    if (state.reduced == null) {
      state.reduced = 0;
    }
    state.reduced += this.increment;
    return state;
  }
}
@ReduxAction("REDUCEABLE_ACTION_TEST", "test4")
class ReduceableAction4 implements IReduceableAction<TestState> {
  constructor(public increment: number) {}

  reduce(state: TestState) {
    state.reduced += this.increment;
    return state;
  }
}

@ReduxAction("MERGABLE_ACTION_TEST", "test5")
class MergeableAction5 {
  constructor(public reduced: number) {}
}

beforeEach(() => {
  StoreManager.dispose();
});

test("dispatch with reduce-able action", () => {
  const storeManager: StoreManager = StoreManager.getInstance({
    test3: new ReduceableReducer<TestState>(initialState),
  });
  expect(storeManager.getSlices().length).toEqual(1);
  let state3pre: TestState = storeManager.getState("test3") as TestState;
  expect(state3pre.reduced).toEqual(0);
  storeManager.dispatch(new ReduceableAction3(2));
  let state3post: TestState = storeManager.getState("test3") as TestState;
  expect(state3post.reduced).toEqual(2);
});

test("dispatch with two reduce-able action", () => {
  const storeManager: StoreManager = StoreManager.getInstance({
    test3: new ReduceableReducer<TestState>(initialState),
    test4: new ReduceableReducer<TestState>(initialState),
  });
  expect(storeManager.getSlices().length).toEqual(2);
  let state3pre: TestState = storeManager.getState("test3") as TestState;
  expect(state3pre.reduced).toEqual(0);
  let state4pre: TestState = storeManager.getState("test3") as TestState;
  expect(state4pre.reduced).toEqual(0);
  storeManager.dispatch(new ReduceableAction3(2));
  storeManager.dispatch(new ReduceableAction4(2));
  let state3post: TestState = storeManager.getState("test3") as TestState;
  expect(state3post.reduced).toEqual(2);
  let state4post: TestState = storeManager.getState("test4") as TestState;
  expect(state4post.reduced).toEqual(2);
});

test("dispatch with one reduce-able action with auto reducer registration", () => {
  const storeManager: StoreManager = StoreManager.getInstance();
  expect(storeManager.getSlices().length).toEqual(0);
  storeManager.dispatch(new ReduceableAction3(2));
  expect(storeManager.getSlices().length).toEqual(1);
  let state3post: TestState = storeManager.getState("test3") as TestState;
  expect(state3post.reduced).toEqual(2);
});

test("dispatch with one merge-able action with merge-able reducer", () => {
  const storeManager: StoreManager = StoreManager.getInstance({
    test5: new MergeableReducer(initialState),
  });
  expect(storeManager.getSlices().length).toEqual(1);
  let state5pre: TestState = storeManager.getState("test5") as TestState;
  expect(state5pre.reduced).toEqual(0);
  storeManager.dispatch(new MergeableAction5(5));
  let state5post: TestState = storeManager.getState("test5") as TestState;
  expect(state5post.reduced).toEqual(5);
});
