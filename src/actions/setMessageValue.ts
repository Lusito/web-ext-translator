import { State } from "../shared";
import { WetMessage } from "../wetInterfaces";
import { x64 as murmurhash3jsx64 } from "murmurhash3js";
const { hash128 } = murmurhash3jsx64;

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
    if (mainLanguage && mainLanguage.messagesByKey[payload.key])
        hash = hash128(mainLanguage.messagesByKey[payload.key].message);
    const messages = [...language.messages];
    const newMessage: WetMessage = { name: payload.key, message: payload.value, hash, group: false };
    const messagesByKey = { ...language.messagesByKey, [payload.key]: newMessage };
    messages[messages.findIndex((m) => m.name === payload.key)] = newMessage;
    const newLanguage = { ...language, messagesByKey, messages };
    extension.languages = { ...extension.languages, [payload.locale]: newLanguage };
    return { ...state, extension };
}
