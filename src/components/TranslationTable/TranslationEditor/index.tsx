/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
import "./style.css";
import { WetAction } from "../../../actions";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { State } from "../../../shared";
import { adjustHeightsFor } from "../../../utils/adjustHeights";
import { WetPlaceholder } from "../../../wetInterfaces";

const UNICODE_REGEX = /(\\u[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F])/g;

interface TranslationEditorDispatchProps {
    setMarkdown: (markdown: string) => void;
    setMessageValue: (key: string, locale: string, value: string) => void;
}

interface TranslationEditorProps {
    value: string;
    messageKey: string;
    placeholders?: WetPlaceholder[];
    locale: string | null;
}

function getPlaceholderValue(key: string, placeholders: { [s: string]: string }) {
    const exactMatch = placeholders[key];
    if (exactMatch)
        return exactMatch;
    const lowerKey = key.toLowerCase();
    const matchKey = Object.getOwnPropertyNames(placeholders).find((e) => e.toLowerCase() === lowerKey);
    return matchKey && placeholders[matchKey] || null;
}

type TranslationEditorMergedProps = TranslationEditorProps & TranslationEditorDispatchProps & {
    placeholdersMap: { [s: string]: string };
};

class TranslationEditor extends React.Component<TranslationEditorMergedProps> {
    private inputRef: HTMLTextAreaElement | null = null;

    public constructor(props: TranslationEditorMergedProps, context?: any) {
        super(props, context);
        this.onInputRef = this.onInputRef.bind(this);
        this.onChange = this.onChange.bind(this);
        this.updateMarkdown = this.updateMarkdown.bind(this);
    }

    public render() {
        const disabled = !this.props.messageKey || !this.props.locale;
        return <React.Fragment>
            <textarea ref={this.onInputRef} onChange={this.onChange} onFocus={this.updateMarkdown} disabled={disabled} value={this.props.value} className="translation-editor"></textarea>
            <div className="translation-editor-outline" />
        </React.Fragment>;
    }

    private onInputRef(e: HTMLTextAreaElement) {
        this.inputRef = e;
    }

    private applyPlaceholders(key: string, value: string) {
        const placeholdersMap = this.props.placeholdersMap;
        return value.replace(/\$\w+\$/g, (s) => getPlaceholderValue(s.substr(1, s.length - 2), placeholdersMap) || s);
    }

    private updateMarkdown() {
        if (this.inputRef) {
            const value = this.inputRef.value.replace(UNICODE_REGEX, (a, b) => JSON.parse(`"${b}"`));
            this.props.setMarkdown(this.applyPlaceholders(this.props.messageKey, value));
        }
    }

    private onChange() {
        if (this.inputRef) {
            this.props.locale && this.props.messageKey && this.props.setMessageValue(this.props.messageKey, this.props.locale, this.inputRef.value);
            const row = this.inputRef.closest(".translation-table-body__row ");
            if (row)
                adjustHeightsFor(row);
            this.updateMarkdown();
        }
    }
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>): TranslationEditorDispatchProps {
    return {
        setMarkdown: (markdown: string) => dispatch({ type: "SET_MARKDOWN", payload: markdown }),
        setMessageValue: (key: string, locale: string, value: string) => dispatch({ type: "SET_MESSAGE_VALUE", payload: { key, value, locale } })
    };
}

function mergeProps(stateProps: {}, dispatchProps: TranslationEditorDispatchProps, ownProps: TranslationEditorProps): TranslationEditorMergedProps {
    const placeholdersMap = {};
    if (ownProps.placeholders) {
        for (const placeholder of ownProps.placeholders) {
            if (placeholder.example)
                placeholdersMap[placeholder.name] = placeholder.example;
        }
    }

    return {
        value: ownProps.value,
        messageKey: ownProps.messageKey,
        placeholders: ownProps.placeholders,
        placeholdersMap,
        locale: ownProps.locale,
        setMarkdown: dispatchProps.setMarkdown,
        setMessageValue: dispatchProps.setMessageValue
    };
}

export default connect<{}, TranslationEditorDispatchProps, TranslationEditorProps, TranslationEditorMergedProps, State>(null, mapDispatchToProps, mergeProps)(TranslationEditor);
