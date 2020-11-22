import { State } from "../State";

export const selectPreviewVisible = (state: State) => state.preview.visible;
export const selectPreviewMarkdown = (state: State) => state.preview.markdown;
export const selectPreviewRTL = (state: State) => state.preview.rtl;
