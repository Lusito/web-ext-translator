/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React, { useRef } from "react";
import { useSelector } from "react-redux-nano";
import { WetLanguage } from "web-ext-translator-shared";

import Dialog from "../Dialog";
import { getNewDialogIndex } from "..";
import { exportToZip } from "../../../utils/exportToZip";
import useCloseDialog from "../useCloseDialog";
import { selectExtension } from "../../../selectors";
import "./style.css";

interface ExportDialogProps {
    index: string;
}

function ExportDialog({ index }: ExportDialogProps) {
    const closeDialog = useCloseDialog();
    const container = useRef<HTMLDivElement>();
    const extension = useSelector(selectExtension);

    function accept() {
        closeDialog(index);
        const exportedLanguages: WetLanguage[] = [];
        const inputs = container.current.querySelectorAll("input");
        for (const input of inputs) {
            const language = input.checked && extension.languages[input.value];
            if (language) exportedLanguages.push(language);
        }
        if (exportedLanguages.length) exportToZip(exportedLanguages, extension.mainLanguage);
    }
    const checkboxes = Object.getOwnPropertyNames(extension.languages).map((locale) => (
        <label key={locale} className="export-dialog__checkbox-label">
            <input type="checkbox" value={locale} defaultChecked />
            {extension.languages[locale].label}
        </label>
    ));

    const buttons = [
        { label: "OK", focus: true, onClick: accept },
        { label: "Cancel", focus: false, onClick: () => closeDialog(index) },
    ];
    return (
        <Dialog className="export-dialog" title="Export Translations" buttons={buttons}>
            <div ref={container}>{checkboxes}</div>
        </Dialog>
    );
}

export default ExportDialog;

export function createExportDialog() {
    const index = getNewDialogIndex().toString();
    return <ExportDialog key={index} index={index} />;
}
