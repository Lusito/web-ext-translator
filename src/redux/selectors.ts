import { State } from "./State";

export const selectAppBridge = (state: State) => state.appBridge;
export const selectDialogs = (state: State) => state.dialogs;
export const selectExtension = (state: State) => state.extension;
export const selectPreviewVisible = (state: State) => state.previewVisible;
export const selectMarkdown = (state: State) => state.markdown;
export const selectMarkdownRTL = (state: State) => state.markdownRTL;
export const selectWebExtensionMode = (state: State) => state.webExtensionMode;
export const selectLoading = (state: State) => state.loading;
