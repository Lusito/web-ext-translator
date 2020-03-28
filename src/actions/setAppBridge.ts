/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { State } from "../shared";
import { WetAppBridge, SaveFilesEntry, LoadFilesResultSuccess } from "../wetInterfaces";
import store from "../store";
import { serializeMessages } from "../utils/exportToZip";
import { createAlertDialog } from "../components/Dialogs/AlertDialog";
import { loadFiles } from "../utils/loader";

export interface WetActionSetAppBridge {
    type: "SET_APP_BRIDGE";
    payload: WetAppBridge;
}

export function loadFromAppBridge(bridge: WetAppBridge, showFolderDialog: boolean) {
    if (!showFolderDialog || bridge.openDirectory()) {
        const result = bridge.loadFiles();
        if (result.error) {
            throw new Error(result.error);
        } else {
            try {
                store.dispatch({ type: "LOAD", payload: loadFiles((result as LoadFilesResultSuccess).data) });
            } catch (e) {
                console.error("error loading files: ", e);
                store.dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Something went wrong!", `Failed to load folder. Reason: ${e.message}`) });
            }
        }
    }
}

export function saveToAppBridge(appBridge: WetAppBridge) {
    const extension = store.getState().extension;
    if (extension) {
        const files: SaveFilesEntry[] = Object.keys(extension.languages)
            .map((key) => extension.languages[key])
            .map((lang) => ({
                locale: lang.locale,
                data: serializeMessages(lang, extension.mainLanguage)
            }));
        appBridge.saveFiles(files);
    }
}

export function handleSetAppBridge(state: State, payload: WetAppBridge): State {
    setTimeout(() => loadFromAppBridge(payload, false), 10);
    return { ...state, appBridge: payload };
}
