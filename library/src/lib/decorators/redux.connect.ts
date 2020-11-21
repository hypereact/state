import { connect } from "react-redux";

export function ReduxConnect(
  mapStateToProps?: (state: any, ownProps?: any) => any
) {
  return function decorator<T extends { new (...args: any[]): {} }>(
    constructor: T
  ) {
    return connect(mapStateToProps)(class extends constructor {} as any) as any;
  };
}
