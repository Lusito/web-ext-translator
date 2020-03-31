/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import Dialog from "../Dialog";
import { LoadedExtension } from "../../../shared";
import { WetAction } from "../../../actions";
import { getNewDialogIndex } from "..";
import { copyToClipboard } from "../../../utils/copyToClipboard";
import { serializeMessages } from "../../../utils/exportToZip";
import { setDirty } from "../../../utils/setDirty";
import "./style.css";

interface SubmitDialogDispatchProps {
    closeDialog?: (key: string) => void;
}

interface SubmitDialogProps {
    index: string;
    extension: LoadedExtension;
}

type SubmitDialogMergedProps = SubmitDialogProps & SubmitDialogDispatchProps;

const COPY_TEMPLATE = `
Updated translations for '{{LOCALE}}': {{LANGUAGE_LABEL}}:
\`\`\`json
{{JSON}}
\`\`\`
`;

const TITLE_TEMPLATE = "Updated translations for '{{LOCALE}}': {{LANGUAGE_LABEL}}";
const BODY_MESSAGE = encodeURIComponent("Your translation have been copied to your clipboard. Paste it here:\n");

function replaceAll(str: string, replacements: Array<[string, string]>) {
    return replacements.reduce((result, args) => result.replace(...args), str);
}

function SubmitDialog({ closeDialog, extension, index }: SubmitDialogMergedProps) {
    let ref: HTMLSelectElement | null = null;

    function accept() {
        closeDialog?.(index);
        if (ref) {
            const language = extension.languages[ref.value];
            const text = replaceAll(COPY_TEMPLATE, [
                ["{{LOCALE}}", language.locale],
                ["{{LANGUAGE_LABEL}}", language.label],
                ["{{JSON}}", serializeMessages(language, extension.mainLanguage)],
            ]);
            copyToClipboard(text);
            if (extension.submitUrl) {
                const title = replaceAll(TITLE_TEMPLATE, [
                    ["{{LOCALE}}", language.locale],
                    ["{{LANGUAGE_LABEL}}", language.label],
                ]);
                const submitUrl = replaceAll(extension.submitUrl, [
                    ["{{TITLE}}", encodeURIComponent(title)],
                    ["{{BODY}}", BODY_MESSAGE],
                ]);
                window.open(submitUrl);
                setDirty(null, false);
            }
        }
    }
    const options = Object.getOwnPropertyNames(extension.languages).map((locale) => (
        <option key={locale} value={locale}>
            {extension.languages[locale].label}
        </option>
    ));

    function cancel() {
        closeDialog?.(index);
    }

    function onRef(e: HTMLSelectElement | null) {
        ref = e;
    }

    const buttons = [
        { label: "OK", focus: true, onClick: accept },
        { label: "Cancel", focus: false, onClick: cancel },
    ];
    const defaultValue =
        extension.firstLocale === extension.mainLanguage.locale ? extension.secondLocale : extension.firstLocale;

    return (
        <Dialog className="submit-dialog" title="Submit Translation" buttons={buttons}>
            <select ref={onRef} className="submit-dialog__select" defaultValue={defaultValue || undefined}>
                {options}
            </select>
        </Dialog>
    );
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {
        closeDialog: (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key }),
    };
}

const ConnectedSubmitDialog = connect<{}, SubmitDialogDispatchProps, SubmitDialogProps>(
    null,
    mapDispatchToProps
)(SubmitDialog);
export default ConnectedSubmitDialog;

export function createSubmitDialog(extension: LoadedExtension) {
    const index = getNewDialogIndex().toString();
    return <ConnectedSubmitDialog key={index} index={index} extension={extension} />;
}
