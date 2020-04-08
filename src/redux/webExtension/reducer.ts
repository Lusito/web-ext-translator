import { mapReducers } from "tsrux";

import { setWebExtensionActive } from "./actions";

const initialState = {
    active: false,
};

export type WebExtensionState = typeof initialState;

export const webExtensionReducer = mapReducers(initialState, (handleAction) => [
    handleAction(setWebExtensionActive, (state, action) => ({ ...state, ...action.payload })),
]);
