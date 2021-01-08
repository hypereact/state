import { PersistentReduceableReducer } from "@hypereact/state";
import { SliceState } from "./slice.state";

const sleep = (ms: number, result: any = null): Promise<any> => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(result);
    }, ms);
  });
};

export class LazyPersistentReduceableReducer extends PersistentReduceableReducer<SliceState> {
  async rehydrate(state: SliceState, data: any): Promise<SliceState> {
    await sleep(5000);
    return {
      ...data,
    };
  }
}
