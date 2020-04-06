import { createReducer } from "deox";

import { setWebExtensionActive } from "./actions";

const initialState = {
    active: false,
};

export type WebExtensionState = typeof initialState;

export const webExtensionReducer = createReducer(initialState, (handleAction) => [
    handleAction(setWebExtensionActive, (state, action) => ({ ...state, ...action.payload })),
]);
