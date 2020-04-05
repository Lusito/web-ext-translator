import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux-nano";
import { WetLanguage } from "web-ext-translator-shared";

import { localeCodeToEnglish } from "../../lib/localeCodeToEnglish";
import { createPromptDialog } from "../Dialogs/PromptDialog";
import { isLocaleRTL } from "../../lib/rtl";
import { selectExtension } from "../../selectors";
import "./style.css";

function validateLocale(value: string) {
    const result = localeCodeToEnglish(value);
    return {
        valid: result.found,
        message: result.found === false ? result.error : result.name,
    };
}

function getLocaleValidator(languages: { [s: string]: WetLanguage }) {
    return (value: string) => {
        // eslint-disable-next-line no-prototype-builtins
        if (languages.hasOwnProperty(value)) {
            return {
                valid: false,
                message: "This locale already exists",
            };
        }
        return validateLocale(value);
    };
}

interface LanguageSelectOptionProps {
    language: WetLanguage;
}

const LanguageSelectOption = ({ language }: LanguageSelectOptionProps) => {
    let className = "language-select__list-item";
    if (isLocaleRTL(language.locale)) className += " language-select__list-item--is-rtl";
    return (
        <option key={language.locale} value={language.locale} className={className}>
            {language.label}
        </option>
    );
};

interface LanguageSelectProps {
    first: boolean;
    tabIndex: number;
}

export default ({ first, tabIndex }: LanguageSelectProps) => {
    const dispatch = useDispatch();
    const extension = useSelector(selectExtension);
    const addLanguage = () => {
        function onAccept(value: string) {
            const otherLocale = first ? extension.secondLocale : extension.firstLocale;
            // fixme: normalize case of locale
            if (value !== otherLocale) {
                dispatch({ type: "ADD_LANGUAGE", payload: value });
                dispatch({ type: "SELECT_LANGUAGE", payload: { first, locale: value } });
            }
        }
        const localeValidator = getLocaleValidator(extension.languages);
        dispatch({
            type: "SHOW_DIALOG",
            payload: createPromptDialog("Enter a locale", "", "en", "", onAccept, localeValidator),
        });
    };
    const selectLanguage = (locale: string | null) => dispatch({ type: "SELECT_LANGUAGE", payload: { first, locale } });

    const ignoreLocale = first ? extension.secondLocale : extension.firstLocale;
    const languages = [];
    for (const key of Object.keys(extension.languages)) {
        const lang = extension.languages[key];
        if (lang.locale !== ignoreLocale) languages.push(lang);
    }
    languages.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
    const selectionLocale = first ? extension.firstLocale : extension.secondLocale;

    const selection = selectionLocale ? extension.languages[selectionLocale] : null;

    const select = useRef<HTMLSelectElement>();
    const onChange = () => {
        let locale: string | null = select.current.value;
        if (locale === "+") {
            addLanguage();
        } else {
            if (locale === "") locale = null;
            selectLanguage(locale);
        }
    };
    const value = selection?.locale || "";
    return (
        <select className="language-select" value={value} onChange={onChange} ref={select} tabIndex={tabIndex}>
            <option key="null" style={{ fontStyle: "italic" }} value="" className="language-select__list-item">
                -- None --
            </option>
            <option key="+" style={{ fontStyle: "italic" }} value="+" className="language-select__list-item">
                ++ New Language ++
            </option>
            {languages.map((language) => (
                <LanguageSelectOption language={language} />
            ))}
        </select>
    );
};
