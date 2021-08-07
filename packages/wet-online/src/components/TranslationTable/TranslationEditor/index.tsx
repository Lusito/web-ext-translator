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
    locale?: string;
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
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const dispatch = useDispatch();
    const setDirty = useSetDirty();
    const disabled = !messageKey || !locale;
    let className = "translation-editor";
    if (modified) className += " translation-editor--is-modified";
    const rtl = !!locale && isLocaleRTL(locale);
    if (rtl) className += " translation-editor--is-rtl";
    if (!value) className += " translation-editor--is-empty";
    const resize = useMemo(
        () =>
            throttle(10, () => {
                const input = inputRef.current;
                if (input) {
                    input.style.height = "5px";
                    input.style.height = `${input.scrollHeight}px`;
                }
            }),
        [inputRef]
    );

    useEffect(() => {
        if (inputRef.current) {
            if (inputRef.current.value !== value) inputRef.current.value = value;
            resize();
        }
    }, [value]);

    useEffect(() => {
        const input = inputRef.current;
        const observer = new ResizeObserver(resize);
        if (input?.parentElement) {
            observer.observe(input.parentElement);
        }
        window.addEventListener("resize", resize);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", resize);
        };
    }, [resize]);

    const updateMarkdown = useMemo(
        () =>
            throttle(200, () => {
                const input = inputRef.current;
                if (input) {
                    const newValue = input.value.replace(UNICODE_REGEX, (a, b) => JSON.parse(`"${b}"`)) ?? "";
                    const markdown = newValue.replace(
                        /\$\w+\$/g,
                        (s) => getPlaceholderValue(s.substr(1, s.length - 2), placeholders) ?? s
                    );
                    dispatch(setPreview(markdown, rtl));
                }
            }),
        [placeholders, rtl]
    );
    useEffect(() => {
        const input = inputRef.current;
        if (input?.parentElement) {
            const parent = input.parentElement;
            const doFocus = () => input.focus();
            parent.addEventListener("click", doFocus);
            return () => parent.removeEventListener("click", doFocus);
        }
        return undefined;
    }, []);

    return (
        <>
            <textarea
                className={className}
                ref={inputRef}
                disabled={disabled}
                onFocus={updateMarkdown}
                onChange={(e) => {
                    resize();
                    if (locale && messageKey) {
                        dispatch(setMessage(locale, messageKey, e.currentTarget.value));
                        setDirty(true);
                    }
                    updateMarkdown();
                }}
                data-searchable={value}
            />
            <div className="translation-editor-outline" />
        </>
    );
};
