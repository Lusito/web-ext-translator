import { State } from "../State";

export const selectExtension = (state: State) => state.extension.extension; // fixme: more specific
export const selectLoading = (state: State) => state.extension.loading;
