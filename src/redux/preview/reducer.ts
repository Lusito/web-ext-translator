import { createReducer } from "deox";

import { setPreview, togglePreview } from "./actions";

const initialState = {
    visible: true,
    markdown: "",
    rtl: false,
};

export type PreviewState = typeof initialState;

export const previewReducer = createReducer(initialState, (handleAction) => [
    handleAction(setPreview, (state, action) => ({ ...state, ...action.payload })),
    handleAction(togglePreview, (state) => ({ ...state, visible: !state.visible })),
]);
