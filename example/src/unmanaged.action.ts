import { IAction } from "@tesseract/state";

export interface UnmanagedStatusSetAction extends IAction {
  type: string;
  status: string;
}
