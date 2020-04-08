import { mapReducers } from "tsrux";
import { WetMessageType, WetMessage, WetLanguage } from "web-ext-translator-shared";

import {
    setMessage,
    removeLanguage,
    selectLanguage,
    loadExtension,
    addLanguage,
    addMessage,
    setLoading,
} from "./actions";
import { hashForLanguage } from "../../utils/getHashFor";
import { localeCodeToEnglish } from "../../lib/localeCodeToEnglish";
import { VcsInfo } from "../../vcs/VcsProvider";

function getBestCommentType(messages: WetMessage[]) {
    for (const message of messages) {
        if (message.type !== WetMessageType.MESSAGE) return message.type;
    }
    return WetMessageType.COMMENT;
}

function getBestGroupName(messages: WetMessage[]) {
    const groupNames = messages.filter((m) => m.type === WetMessageType.GROUP).map((m) => m.name);

    let groupIndex = 0;
    let groupName = "";
    do {
        groupName = `__WET_GROUP__${groupIndex++}`;
    } while (groupNames.includes(groupName));
    return groupName;
}

export interface LoadedExtension {
    firstLocale: string | null;
    secondLocale: string | null;
    languages: { [s: string]: WetLanguage };
    mainLanguage: WetLanguage;
    submitUrl?: string;
    vcsInfo?: VcsInfo;
}

const initialState = {
    loading: "",
    extension: null as LoadedExtension | null,
};

export type ExtensionState = typeof initialState;

export const extensionReducer = mapReducers(initialState, (handleAction) => [
    handleAction(setMessage, (state, { payload }) => {
        if (!state.extension) return state;
        const language = state.extension.languages[payload.locale];
        if (!language) return state;

        const mainLanguage = state.extension.languages[state.extension.mainLanguage.locale];
        let hash = "";
        if (mainLanguage && mainLanguage !== language && mainLanguage.messagesByKey[payload.key])
            hash = hashForLanguage(mainLanguage, payload.key);

        const messages = [...language.messages];
        const newMessage: WetMessage = {
            name: payload.key,
            message: payload.value,
            hash,
            type: WetMessageType.MESSAGE,
        };
        const messagesByKey = { ...language.messagesByKey, [payload.key]: newMessage };
        messages[messages.findIndex((m) => m.name === payload.key)] = newMessage;
        const newLanguage = { ...language, messagesByKey, messages };
        const newState = {
            ...state,
            extension: {
                ...state.extension,
                languages: {
                    ...state.extension.languages,
                    [payload.locale]: newLanguage,
                },
            },
        };
        if (mainLanguage === language) newState.extension.mainLanguage = newLanguage;
        return newState;
    }),
    handleAction(addMessage, (state, { payload }) => {
        if (!state.extension) return state;
        const mainLanguage = JSON.parse(JSON.stringify(state.extension.mainLanguage)) as WetLanguage;
        const index = mainLanguage.messages.findIndex((m) => m.name === payload.referenceMessageName);
        if (index === -1) return state;

        const newMessage: WetMessage = {
            type: payload.asGroup ? getBestCommentType(mainLanguage.messages) : WetMessageType.MESSAGE,
            name: payload.asGroup ? getBestGroupName(mainLanguage.messages) : payload.newMessageName,
            message: payload.asGroup ? payload.newMessageName : "",
        };
        const insertIndex = payload.insertBefore ? index : index + 1;
        mainLanguage.messages.splice(insertIndex, 0, newMessage);
        mainLanguage.messagesByKey[payload.newMessageName] = newMessage;

        return {
            ...state,
            extension: {
                ...state.extension,
                languages: { ...state.extension.languages, [mainLanguage.locale]: mainLanguage },
                mainLanguage,
            },
        };
    }),
    handleAction(removeLanguage, (state, { payload }) => {
        if (!state.extension) return state;
        const { locale } = payload;
        if (state.extension.mainLanguage.locale === locale || !state.extension.languages[locale]) return state;
        const languages = { ...state.extension.languages };
        delete languages[locale];
        return {
            ...state,
            extension: {
                ...state.extension,
                languages,
            },
        };
    }),
    handleAction(selectLanguage, (state, { payload }) => {
        if (!state.extension) return state;
        const { locale, which } = payload;
        if (locale && !state.extension.languages[locale]) return state;
        return {
            ...state,
            extension: {
                ...state.extension,
                [which]: locale,
            },
        };
    }),
    handleAction(addLanguage, (state, { payload }) => {
        if (!state.extension) return state;
        const { locale } = payload;
        const result = localeCodeToEnglish(locale);
        if (!result.found || state.extension.languages[locale]) return state;
        const language: WetLanguage = { locale, label: result.name, messages: [], messagesByKey: {} };
        return {
            ...state,
            extension: {
                ...state.extension,
                languages: { ...state.extension.languages, [locale]: language },
            },
        };
    }),
    handleAction(setLoading, (state, { payload }) => ({
        ...state,
        loading: payload.message,
    })),
    handleAction(loadExtension, (state, { payload }) => {
        const languages: { [locale: string]: WetLanguage } = {};
        payload.languages.forEach((lang) => {
            languages[lang.locale] = lang;
        });
        const firstLocale = payload.mainLanguage.locale;
        const secondLocale = payload.languages.map((l) => l.locale).find((l) => l !== firstLocale) || null;
        return {
            ...state,
            extension: {
                languages,
                mainLanguage: payload.mainLanguage,
                firstLocale,
                secondLocale,
                submitUrl: payload.submitUrl,
                vcsInfo: payload.vcsInfo,
            },
        };
        // fixme: reset, markdown: "", markdownRTL: false }
    }),
]);
