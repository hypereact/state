import { IAction } from "@tessereact/state";

export interface UnmanagedStatusSetAction extends IAction {
  type: string;
  status: string;
}
