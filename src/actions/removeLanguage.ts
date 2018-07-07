import { State } from "../shared";

export interface WetActionRemoveLanguage {
    type: "REMOVE_LANGUAGE";
    payload: string;
}

export function handleRemoveLanguage(state: State, payload: string): State {
    if (!state.extension)
        return state;
    const extension = { ...state.extension };
    if (extension.mainLanguage.locale === payload || !extension.languages[payload])
        return state;
    extension.languages = { ...extension.languages };
    delete extension.languages[payload];
    return { ...state, extension };
}
