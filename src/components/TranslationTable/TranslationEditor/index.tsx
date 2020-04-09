import React, { useRef, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux-nano";
import { WetPlaceholder } from "web-ext-translator-shared";
import { throttle } from "throttle-debounce";

import { isLocaleRTL } from "../../../lib/rtl";
import "./style.css";
import { setPreview } from "../../../redux/preview";
import { setMessage } from "../../../redux/extension";
import { useSetDirty } from "../../../hooks";

const UNICODE_REGEX = /(\\u[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F])/g;

interface TranslationEditorProps {
    modified: boolean;
    value: string;
    messageKey: string;
    placeholders?: WetPlaceholder[];
    locale: string | null;
}

function getPlaceholderValue(key: string, placeholders?: WetPlaceholder[]) {
    if (!placeholders) return null;
    const validPlaceholders = placeholders.filter((p) => !!p.example);
    const exactMatch = validPlaceholders.find((p) => p.name === key);
    if (exactMatch) return exactMatch.example;
    const lowerKey = key.toLowerCase();
    const match = placeholders.find((e) => e.name.toLowerCase() === lowerKey);
    return match ? match.example : null;
}

export default ({ messageKey, locale, modified, value, placeholders }: TranslationEditorProps) => {
    const inputRef = useRef<HTMLDivElement | null>(null);
    const dispatch = useDispatch();
    const setDirty = useSetDirty();
    const disabled = !messageKey || !locale;
    let className = "translation-editor";
    if (modified) className += " translation-editor--is-modified";
    const rtl = locale && isLocaleRTL(locale);
    if (rtl) className += " translation-editor--is-rtl";
    if (!value) className += " translation-editor--is-empty";

    useEffect(() => {
        if (inputRef.current.textContent !== value || inputRef.current.querySelector("*"))
            inputRef.current.textContent = value;
    }, [value]);

    const removeFormatting = () => {
        // eslint-disable-next-line no-self-assign
        if (inputRef.current.querySelector("*")) inputRef.current.textContent = inputRef.current.textContent;
    };
    const updateMarkdown = useMemo(
        () =>
            throttle(200, () => {
                if (inputRef.current) {
                    const newValue = inputRef.current.textContent.replace(UNICODE_REGEX, (a, b) =>
                        JSON.parse(`"${b}"`)
                    );
                    const markdown = newValue.replace(
                        /\$\w+\$/g,
                        (s) => getPlaceholderValue(s.substr(1, s.length - 2), placeholders) || s
                    );
                    dispatch(setPreview(markdown, rtl));
                }
            }),
        [placeholders, rtl]
    );
    const onChange = useMemo(
        () =>
            throttle(200, () => {
                if (inputRef.current) {
                    if (locale && messageKey) {
                        const newValue = inputRef.current.textContent;
                        removeFormatting();
                        dispatch(setMessage(locale, messageKey, newValue));
                        setDirty(true);
                    }
                    updateMarkdown();
                }
            }),
        [updateMarkdown, locale, messageKey]
    );
    const onFocus = () => {
        removeFormatting();
        updateMarkdown();
    };
    useEffect(() => {
        const parent = inputRef.current.parentElement;
        const doFocus = () => inputRef.current.focus();
        parent.addEventListener("click", doFocus);
        return () => parent.removeEventListener("click", doFocus);
    }, []);

    return (
        <>
            <div
                className={className}
                ref={inputRef}
                contentEditable={!disabled}
                onFocus={onFocus}
                onInput={onChange}
                data-searchable={value}
            />
            <div className="translation-editor-outline" />
        </>
    );
};
