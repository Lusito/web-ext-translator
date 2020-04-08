import { mapReducers } from "tsrux";

import { setPreview, togglePreview } from "./actions";

const initialState = {
    visible: true,
    markdown: "",
    rtl: false,
};

export type PreviewState = typeof initialState;

export const previewReducer = mapReducers(initialState, (handleAction) => [
    handleAction(setPreview, (state, action) => ({ ...state, ...action.payload })),
    handleAction(togglePreview, (state) => ({ ...state, visible: !state.visible })),
]);
