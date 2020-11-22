import React, { useRef } from "react";
import { useSelector } from "react-redux-nano";

import Dialog from "../Dialog";
import { copyToClipboard } from "../../../utils/copyToClipboard";
import { serializeMessages } from "../../../utils/exportToZip";
import { selectExtension } from "../../../redux/extension";
import { useSetDirty } from "../../../hooks";
import "./style.css";

interface SubmitDialogProps {
    onClose: () => void;
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

export default ({ onClose }: SubmitDialogProps) => {
    const setDirty = useSetDirty();
    const select = useRef<HTMLSelectElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const extension = useSelector(selectExtension)!;

    function accept() {
        onClose();
        if (select.current) {
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
                setDirty(false);
            }
        }
    }
    const options = Object.getOwnPropertyNames(extension.languages).map((locale) => (
        <option key={locale} value={locale}>
            {extension.languages[locale].label}
        </option>
    ));

    const buttons = [
        { label: "OK", focus: true, onClick: accept },
        { label: "Cancel", focus: false, onClick: onClose },
    ];
    const defaultValue =
        extension.firstLocale === extension.mainLanguage.locale ? extension.secondLocale : extension.firstLocale;

    return (
        <Dialog className="submit-dialog" title="Submit Translation" buttons={buttons}>
            <select ref={select} className="submit-dialog__select" defaultValue={defaultValue ?? undefined}>
                {options}
            </select>
        </Dialog>
    );
};
