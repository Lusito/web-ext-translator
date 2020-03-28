/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { WetAppBridge, WetSaveFilesEntry } from "web-ext-translator-shared";
import store from "../store";
import { serializeMessages } from "../utils/exportToZip";
import { createAlertDialog } from "../components/Dialogs/AlertDialog";
import { loadFiles } from "../utils/loader";

export function loadFromAppBridge(bridge: WetAppBridge) {
    const result = bridge.loadFiles();
    if (typeof result === "string") {
        store.dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Something went wrong!", result) });
    } else {
        try {
            store.dispatch({ type: "LOAD", payload: loadFiles(result) });
        } catch (e) {
            console.error("error loading files: ", e);
            store.dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Something went wrong!", `Failed to load folder. Reason: ${e.message}`) });
        }
    }
}

export function saveToAppBridge(appBridge: WetAppBridge) {
    const extension = store.getState().extension;
    if (extension) {
        const files: WetSaveFilesEntry[] = Object.keys(extension.languages)
            .map((key) => extension.languages[key])
            .map((lang) => ({
                locale: lang.locale,
                data: serializeMessages(lang, extension.mainLanguage)
            }));
        appBridge.saveFiles(files);
    }
}
