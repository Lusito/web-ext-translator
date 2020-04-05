import { State } from "../State";

export interface WetActionPreviewToggle {
    type: "PREVIEW_TOGGLE";
    payload: null;
}

export function handlePreviewToggle(state: State): State {
    return { ...state, previewVisible: !state.previewVisible };
}
