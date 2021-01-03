import { IAction } from "@hypereact/state";

export interface UnmanagedStatusSetAction extends IAction {
  type: string;
  status: string;
}
