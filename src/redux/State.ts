import { PreviewState } from "./preview/reducer";
import { ExtensionState } from "./extension/reducer";
import { WebExtensionState } from "./webExtension/reducer";

export interface State {
    preview: PreviewState;
    extension: ExtensionState;
    webExtension: WebExtensionState;
}
