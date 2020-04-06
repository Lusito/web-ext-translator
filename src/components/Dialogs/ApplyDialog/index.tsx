import React, { useRef } from "react";
import { useSelector } from "react-redux-nano";

import Dialog from "../Dialog";
import { selectExtension } from "../../../redux/extension";
import "./style.css";

interface ApplyDialogProps {
    onClose: () => void;
}

export default ({ onClose }: ApplyDialogProps) => {
    const extension = useSelector(selectExtension);
    const select = useRef<HTMLSelectElement>();

    function accept() {
        onClose();
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
        { label: "Cancel", focus: false, onClick: onClose },
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
};
