/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React, { useRef } from "react";
import { useSelector } from "react-redux-nano";

import Dialog from "../Dialog";
import { getNewDialogIndex } from "..";
import useCloseDialog from "../useCloseDialog";
import { selectExtension } from "../../../selectors";
import "./style.css";

interface ApplyDialogProps {
    index: string;
}

function ApplyDialog({ index }: ApplyDialogProps) {
    const closeDialog = useCloseDialog();
    const extension = useSelector(selectExtension);
    const select = useRef<HTMLSelectElement>();

    function accept() {
        closeDialog(index);
        const language = extension.languages[select.current.value];
        if (extension.vcsInfo) {
            window.postMessage(
                {
                    action: "WetApplyLanguage",
                    language,
                    vcsHost: extension.vcsInfo.host,
                    vcsUser: extension.vcsInfo.user,
                    vcsRepository: extension.vcsInfo.repository,
                },
                "*"
            );
        }
    }
    const options = Object.getOwnPropertyNames(extension.languages).map((locale) => (
        <option key={locale} value={locale}>
            {extension.languages[locale].label}
        </option>
    ));

    const buttons = [
        { label: "OK", focus: true, onClick: accept },
        { label: "Cancel", focus: false, onClick: () => closeDialog(index) },
    ];
    const defaultValue =
        extension.firstLocale === extension.mainLanguage.locale ? extension.secondLocale : extension.firstLocale;

    return (
        <Dialog className="apply-dialog" title="Apply Translation" buttons={buttons}>
            <select ref={select} className="apply-dialog__select" defaultValue={defaultValue || undefined}>
                {options}
            </select>
        </Dialog>
    );
}

export default ApplyDialog;

export function createApplyDialog() {
    const index = getNewDialogIndex().toString();
    return <ApplyDialog key={index} index={index} />;
}
