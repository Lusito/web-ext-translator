import { actionCreator } from "tsrux";
import { WetLanguage } from "web-ext-translator-shared";

import { VcsInfo } from "../../vcs/VcsProvider";

export const setMessage = actionCreator("EXTENSION/SET_MESSAGE", (locale: string, key: string, value: string) => ({
    locale,
    key,
    value,
}));

export const addMessage = actionCreator(
    "EXTENSION/ADD_MESSAGE",
    (asGroup: boolean, insertBefore: boolean, referenceMessageName: string, newMessageName: string) => ({
        asGroup,
        insertBefore,
        referenceMessageName,
        newMessageName,
    })
);

export const removeLanguage = actionCreator("EXTENSION/REMOVE_LANGUAGE", (locale: string) => ({ locale }));

export const selectLanguage = actionCreator(
    "EXTENSION/SELECT_LANGUAGE",
    (locale: string | null, which: "firstLocale" | "secondLocale") => ({ locale, which })
);

export const addLanguage = actionCreator("EXTENSION/ADD_LANGUAGE", (locale: string) => ({ locale }));

export interface LoadExtensionData {
    languages: WetLanguage[];
    mainLanguage: WetLanguage;
    submitUrl?: string;
    vcsInfo?: VcsInfo;
}

export const loadExtension = actionCreator("EXTENSION/LOAD", (data: LoadExtensionData) => data);

export const setLoading = actionCreator("EXTENSION/SET_LOADING", (message: string) => ({ message }));
