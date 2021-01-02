import { PersistentReduceableReducer, StoreManager } from "..";

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
class ReduceableReducer6 extends PersistentReduceableReducer<TestState> {
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
class ReduceableReducer7 extends PersistentReduceableReducer<TestState> {
  rehydrate(state: TestState, data: any): TestState {
    return rehydrateThrow(state, data);
  }
  dehydrate(state: TestState): any {
    return dehydrateThrow(state);
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

test("hydratable reducer methods are properly invoked", (): void => {
  const reducer = new ReduceableReducer6(initialState);
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
  StoreManager.dispose();
  const storeManager2: StoreManager = StoreManager.getInstance({
    test7: reducer,
  });
  expect(storeManager2.getSlices().length).toEqual(1);
  let state6post: TestState = storeManager1.getState("test6") as TestState;
  expect(state6post.reduced).toEqual(7);
});

test("hydratable reducer faulty methods are properly invoked and handled", (): void => {
  const reducer = new ReduceableReducer7(initialState);
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
  let state6post: TestState = storeManager1.getState("test7") as TestState;
  expect(state6post.reduced).toEqual(0);
});
