/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { WetActionAddLanguage, handleAddLanguage } from "./addLanguage";
import { WetActionSelectLanguage, handleSelectLanguage } from "./selectLanguage";
import { WetActionRemoveLanguage, handleRemoveLanguage } from "./removeLanguage";
import { WetActionPreviewToggle, handlePreviewToggle } from "./previewToggle";
import { WetActionShowDialog, handleShowDialog } from "./showDialog";
import { WetActionHideDialog, handleHideDialog } from "./hideDialog";
import { WetActionSetMarkdown, handleSetMarkdown } from "./setMarkdown";
import { State } from "../shared";
import { WetActionSetMessageValue, handleSetMessageValue } from "./setMessageValue";
import { WetActionLoad, handleLoad } from "./load";
import { WetActionSetLoading, handleSetLoading } from "./setLoading";
import { WetActionSetAppBridge, handleSetAppBridge } from "./setAppBridge";
import { WetActionEnableWebExtensionMode, handleEnableWebExtensionMode } from "./enableWebExtensionMode";
import { handleAddMessage, WetActionAddMessage } from "./addMessage";

export type WetAction =
    WetActionAddLanguage |
    WetActionAddMessage |
    WetActionSelectLanguage |
    WetActionRemoveLanguage |
    WetActionSetMessageValue |
    WetActionPreviewToggle |
    WetActionSetMarkdown |
    WetActionShowDialog |
    WetActionHideDialog |
    WetActionLoad |
    WetActionSetLoading |
    WetActionSetAppBridge |
    WetActionEnableWebExtensionMode;

export function reducer(state: State, action: WetAction) {
    switch (action.type) {
        case "ADD_LANGUAGE": return handleAddLanguage(state, action.payload);
        case "ADD_MESSAGE": return handleAddMessage(state, action.payload);
        case "SELECT_LANGUAGE": return handleSelectLanguage(state, action.payload);
        case "REMOVE_LANGUAGE": return handleRemoveLanguage(state, action.payload);
        case "SET_MESSAGE_VALUE": return handleSetMessageValue(state, action.payload);
        case "PREVIEW_TOGGLE": return handlePreviewToggle(state, action.payload);
        case "SHOW_DIALOG": return handleShowDialog(state, action.payload);
        case "HIDE_DIALOG": return handleHideDialog(state, action.payload);
        case "SET_MARKDOWN": return handleSetMarkdown(state, action.payload);
        case "LOAD": return handleLoad(state, action.payload);
        case "SET_LOADING": return handleSetLoading(state, action.payload);
        case "SET_APP_BRIDGE": return handleSetAppBridge(state, action.payload);
        case "ENABLE_WEB_EXTENSION_MODE": return handleEnableWebExtensionMode(state);
    }

    return state;
}
