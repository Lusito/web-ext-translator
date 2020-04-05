import { WetLanguage } from "web-ext-translator-shared";

import { State } from "../shared";
import { VcsInfo } from "../vcs/VcsBaseProvider";
import { setDirty } from "../utils/setDirty";

export interface WetActionLoadPayload {
    languages: WetLanguage[];
    mainLanguage: WetLanguage;
    submitUrl?: string;
    vcsInfo?: VcsInfo;
}

export interface WetActionLoad {
    type: "LOAD";
    payload: WetActionLoadPayload;
}

export function handleLoad(state: State, payload: WetActionLoadPayload): State {
    const languages: { [locale: string]: WetLanguage } = {};
    payload.languages.forEach((lang) => {
        languages[lang.locale] = lang;
    });
    const firstLocale = payload.mainLanguage.locale;
    const secondLocale = payload.languages.map((l) => l.locale).find((l) => l !== firstLocale) || null;
    const extension = {
        languages,
        mainLanguage: payload.mainLanguage,
        firstLocale,
        secondLocale,
        submitUrl: payload.submitUrl,
        vcsInfo: payload.vcsInfo,
    };
    setDirty(state.appBridge, false);
    return { ...state, extension, markdown: "", markdownRTL: false };
}
