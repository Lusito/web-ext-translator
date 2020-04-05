import React, { useRef } from "react";
import { useSelector } from "react-redux-nano";

import Dialog from "../Dialog";
import { getNewDialogIndex } from "..";
import { copyToClipboard } from "../../../utils/copyToClipboard";
import { serializeMessages } from "../../../utils/exportToZip";
import { setDirty } from "../../../utils/setDirty";
import { useCloseDialog } from "../../../hooks";
import { selectExtension } from "../../../redux/selectors";
import "./style.css";

interface SubmitDialogProps {
    index: string;
}

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

function SubmitDialog({ index }: SubmitDialogProps) {
    const select = useRef<HTMLSelectElement>();
    const extension = useSelector(selectExtension);
    const closeDialog = useCloseDialog();

    function accept() {
        closeDialog(index);
        if (select) {
            const language = extension.languages[select.current.value];
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
        closeDialog(index);
    }

    const buttons = [
        { label: "OK", focus: true, onClick: accept },
        { label: "Cancel", focus: false, onClick: cancel },
    ];
    const defaultValue =
        extension.firstLocale === extension.mainLanguage.locale ? extension.secondLocale : extension.firstLocale;

    return (
        <Dialog className="submit-dialog" title="Submit Translation" buttons={buttons}>
            <select ref={select} className="submit-dialog__select" defaultValue={defaultValue || undefined}>
                {options}
            </select>
        </Dialog>
    );
}

export default SubmitDialog;

export function createSubmitDialog() {
    const index = getNewDialogIndex().toString();
    return <SubmitDialog key={index} index={index} />;
}
