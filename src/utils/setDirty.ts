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
