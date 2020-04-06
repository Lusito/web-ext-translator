import { createAction } from "deox";
import { WetLanguage } from "web-ext-translator-shared";

import { VcsInfo } from "../../vcs/VcsProvider";

export const setMessage = createAction(
    "EXTENSION/SET_MESSAGE",
    (resolve) => (locale: string, key: string, value: string) => resolve({ locale, key, value })
);

export const addMessage = createAction(
    "EXTENSION/ADD_MESSAGE",
    (resolve) => (asGroup: boolean, insertBefore: boolean, referenceMessageName: string, newMessageName: string) =>
        resolve({ asGroup, insertBefore, referenceMessageName, newMessageName })
);

export const removeLanguage = createAction("EXTENSION/REMOVE_LANGUAGE", (resolve) => (locale: string) =>
    resolve({ locale })
);

export const selectLanguage = createAction(
    "EXTENSION/SELECT_LANGUAGE",
    (resolve) => (locale: string, which: "firstLocale" | "secondLocale") => resolve({ locale, which })
);

export const addLanguage = createAction("EXTENSION/ADD_LANGUAGE", (resolve) => (locale: string) => resolve({ locale }));

export interface LoadExtensionData {
    languages: WetLanguage[];
    mainLanguage: WetLanguage;
    submitUrl?: string;
    vcsInfo?: VcsInfo;
}

export const loadExtension = createAction("EXTENSION/LOAD", (resolve) => (data: LoadExtensionData) => resolve(data));

export const setLoading = createAction("EXTENSION/SET_LOADING", (resolve) => (message: string) => resolve({ message }));
