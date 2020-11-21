import { IAction } from "@tesseract/state";

export interface UnmanagedTitleSetAction extends IAction {
  type: string;
  title: string;
}
