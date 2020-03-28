/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { WetAppBridge } from "web-ext-translator-shared";

function onBeforeUnload() {
    return "There are unsaved changes. Discard all changes?";
}

export function setDirty(appBridge: WetAppBridge | null, dirty: boolean) {
    if (appBridge) {
        appBridge.setDirty(dirty);
    } else {
        window.onbeforeunload = dirty ? onBeforeUnload : null;
    }
}
