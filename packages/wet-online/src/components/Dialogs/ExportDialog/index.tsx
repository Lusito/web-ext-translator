import React, { useRef } from "react";
import { useSelector } from "react-redux-nano";
import { WetLanguage } from "web-ext-translator-shared";

import Dialog from "../Dialog";
import { exportToZip } from "../../../utils/exportToZip";
import { selectExtension } from "../../../redux/extension";
import "./style.css";
import { useSetDirty } from "../../../hooks";

interface ExportDialogProps {
    onClose: () => void;
}

export default ({ onClose }: ExportDialogProps) => {
    const setDirty = useSetDirty();
    const container = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const extension = useSelector(selectExtension)!;

    function accept() {
        if (!container.current) return;
        onClose();
        const exportedLanguages: WetLanguage[] = [];
        const inputs = container.current.querySelectorAll("input");
        for (const input of inputs) {
            const language = input.checked && extension.languages[input.value];
            if (language) exportedLanguages.push(language);
        }
        if (exportedLanguages.length) exportToZip(exportedLanguages, extension.mainLanguage, setDirty);
    }
    const checkboxes = Object.getOwnPropertyNames(extension.languages).map((locale) => (
        <label key={locale} className="export-dialog__checkbox-label">
            <input type="checkbox" value={locale} defaultChecked />
            {extension.languages[locale].label}
        </label>
    ));

    const buttons = [
        { label: "OK", focus: true, onClick: accept },
        { label: "Cancel", focus: false, onClick: onClose },
    ];
    return (
        <Dialog className="export-dialog" title="Export Translations" buttons={buttons}>
            <div ref={container}>{checkboxes}</div>
        </Dialog>
    );
};
