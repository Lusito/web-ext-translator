/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
import "./style.css";
import { WetAction } from "../../actions";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { State, LoadedExtension } from "../../shared";
import { localeCodeToEnglish } from "../../lib/localeCodeToEnglish";
import { createPromptDialog } from "../Dialogs/PromptDialog";
import { WetLanguage } from "../../wetInterfaces";

function validateLocale(value: string) {
    const result = localeCodeToEnglish(value);
    return {
        valid: result.found,
        message: result.found ? result.name : result.error
    };
}

function getLocaleValidator(languages: { [s: string]: WetLanguage }) {
    return (value: string) => {
        if (languages.hasOwnProperty(value)) {
            return {
                valid: false,
                message: "This locale already exists"
            };
        }
        return validateLocale(value);
    };
}

interface LanguageSelectDispatchProps {
    addLanguage: (extension: LoadedExtension, first: boolean) => void;
    selectLanguage: (first: boolean, locale: string | null) => void;
}

interface LanguageSelectProps {
    first: boolean;
    tabIndex: number;
    extension: LoadedExtension;
}

interface LanguageSelectMergedProps {
    first: boolean;
    tabIndex: number;
    extension: LoadedExtension;
    selection: WetLanguage | null;
    languages: WetLanguage[];
    addLanguage: (extension: LoadedExtension, first: boolean) => void;
    selectLanguage: (first: boolean, locale: string | null) => void;
}

class LanguageSelect extends React.Component<LanguageSelectMergedProps> {
    private selectRef: HTMLSelectElement | null = null;

    public constructor(props: LanguageSelectMergedProps, context?: any) {
        super(props, context);
        this.onSelectRef = this.onSelectRef.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    public render() {
        const value = this.props.selection && this.props.selection.locale || "";
        return <select className="language-select" value={value} onChange={this.onChange} ref={this.onSelectRef}>
            <option key="null" style={{ fontStyle: "italic" }} value="" className="language-select__list-item">-- None --</option>
            <option key="+" style={{ fontStyle: "italic" }} value="+" className="language-select__list-item">++ New Language ++</option>
            {this.props.languages.map((l) => <option key={l.locale} value={l.locale} className="language-select__list-item">{l.label}</option>)}
        </select>;
    }

    private onSelectRef(e: HTMLSelectElement) {
        this.selectRef = e;
    }

    private onChange() {
        if (this.selectRef) {
            let locale: string | null = this.selectRef.value;
            if (locale === "+") {
                this.props.addLanguage(this.props.extension, this.props.first);
            } else {
                if (locale === "")
                    locale = null;
                this.props.selectLanguage(this.props.first, locale);
            }
        }
    }
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>): LanguageSelectDispatchProps {
    return {
        addLanguage: (extension: LoadedExtension, first: boolean) => {
            function addLanguage(value: string) {
                const otherLocale = first ? extension.secondLocale : extension.firstLocale;
                // fixme: normalize case of locale
                if (value !== otherLocale) {
                    dispatch({ type: "ADD_LANGUAGE", payload: value });
                    dispatch({ type: "SELECT_LANGUAGE", payload: { first, locale: value } });
                }
            }
            const localeValidator = getLocaleValidator(extension.languages);
            dispatch({ type: "SHOW_DIALOG", payload: createPromptDialog("Enter a locale", "", "en", "", addLanguage, localeValidator) });
        },
        selectLanguage: (first: boolean, locale: string | null) => dispatch({ type: "SELECT_LANGUAGE", payload: { first, locale } })
    };
}

function mergeProps(stateProps: {}, dispatchProps: LanguageSelectDispatchProps, ownProps: LanguageSelectProps): LanguageSelectMergedProps {
    const ignoreLocale = ownProps.first ? ownProps.extension.secondLocale : ownProps.extension.firstLocale;
    const languages = [];
    for (const key in ownProps.extension.languages) {
        const lang = ownProps.extension.languages[key];
        if (lang.locale !== ignoreLocale)
            languages.push(lang);
    }
    languages.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
    const selectionLocale = ownProps.first ? ownProps.extension.firstLocale : ownProps.extension.secondLocale;

    return {
        first: ownProps.first,
        tabIndex: ownProps.tabIndex,
        extension: ownProps.extension,
        selection: selectionLocale ? ownProps.extension.languages[selectionLocale] : null,
        languages,
        addLanguage: dispatchProps.addLanguage,
        selectLanguage: dispatchProps.selectLanguage
    };
}

export default connect<{}, LanguageSelectDispatchProps, LanguageSelectProps, LanguageSelectMergedProps, State>(null, mapDispatchToProps, mergeProps)(LanguageSelect);
