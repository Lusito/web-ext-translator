/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { State } from "../shared";
import { WetMessage, WetMessageType } from "../wetInterfaces";
import { hashForLanguage } from "../utils/getHashFor";

export interface WetActionSetMessageValuePayload {
    key: string;
    locale: string;
    value: string;
}

export interface WetActionSetMessageValue {
    type: "SET_MESSAGE_VALUE";
    payload: WetActionSetMessageValuePayload;
}

export function handleSetMessageValue(state: State, payload: WetActionSetMessageValuePayload): State {
    if (!state.extension)
        return state;
    const extension = { ...state.extension };
    const language = extension.languages[payload.locale];
    if (!language)
        return state;

    const mainLanguage = extension.languages[extension.mainLanguage.locale];
    let hash = "";
    if (mainLanguage && mainLanguage !== language && mainLanguage.messagesByKey[payload.key])
        hash = hashForLanguage(mainLanguage, payload.key);

    const messages = [...language.messages];
    const newMessage: WetMessage = { name: payload.key, message: payload.value, hash, type: WetMessageType.MESSAGE };
    const messagesByKey = { ...language.messagesByKey, [payload.key]: newMessage };
    messages[messages.findIndex((m) => m.name === payload.key)] = newMessage;
    const newLanguage = { ...language, messagesByKey, messages };
    extension.languages = { ...extension.languages, [payload.locale]: newLanguage };
    if (mainLanguage === language)
        extension.mainLanguage = newLanguage;
    return { ...state, extension };
}
