/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Key } from "ts-keycode-enum";
import { State } from "../../../shared";
import { search } from "../../../search";
import "./style.css";

const stopEvent = (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
};

function useAndSetRef<T>(value: T) {
    const ref = useRef(value);
    ref.current = value;
    return ref;
}

export function TranslationSearch() {
    const searchRef = useRef<HTMLInputElement>();
    const bridge = useSelector((state: State) => state.appBridge);
    const [searchOpen, setSearchOpen] = useState(false);
    const needle = useRef("");
    const applySearch = useAndSetRef((searchNext: boolean, forward: boolean, update?: boolean) => {
        if (update && searchRef.current)
            needle.current = searchRef.current.value;
        needle.current && search(needle.current, searchNext, forward);
    });
    useEffect(() => {
        // if (bridge) {
        const downListener = (e: KeyboardEvent) => {
            if ((e.ctrlKey && e.keyCode == Key.F) || e.keyCode === Key.F3) stopEvent(e);
        };
        const upListener = (e: KeyboardEvent) => {
            if (e.keyCode === Key.Escape) setSearchOpen(false);
            else if (e.keyCode == Key.F3) {
                applySearch.current(true, !e.shiftKey);
                stopEvent(e);
            } else if (e.ctrlKey && e.keyCode == Key.F) {
                setSearchOpen(true);
                stopEvent(e);
                if (searchRef.current)
                    searchRef.current.focus();
            }
        };
        window.addEventListener("keydown", downListener, false);
        window.addEventListener("keyup", upListener, false);
        return () => {
            window.removeEventListener("keyup", downListener, false);
            window.removeEventListener("keyup", upListener, false);
        };
        // }
    }, [bridge]);
    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchOpen]);
    const onFocus = () => {
        if (searchRef.current.value)
            applySearch.current(false, true, true);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode == Key.Enter) {
            applySearch.current(true, !e.shiftKey);
        }
    };

    return !searchOpen ? null : (
        <div className="translation-search">
            <input
                className="translation-search__input"
                placeholder="...search"
                onChange={() => applySearch.current(false, true, true)}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                ref={searchRef}
                defaultValue={needle.current}
            />
            <button className="translation-search__button" onClick={() => applySearch.current(true, false)}>
                Prev
            </button>
            <button className="translation-search__button" onClick={() => applySearch.current(true, true)}>
                Next
            </button>
        </div>
    );
}
