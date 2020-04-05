import { State } from "../State";

export interface WetActionEnableWebExtensionMode {
    type: "ENABLE_WEB_EXTENSION_MODE";
}

export function handleEnableWebExtensionMode(state: State): State {
    return { ...state, webExtensionMode: true };
}
