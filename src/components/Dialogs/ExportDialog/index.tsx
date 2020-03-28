/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import "./style.css";
import Dialog from "../Dialog";
import { LoadedExtension } from "../../../shared";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { WetAction } from "../../../actions";
import { getNewDialogIndex } from "../../Dialogs";
import { WetLanguage } from "../../../wetInterfaces";
import { exportToZip } from "../../../utils/exportToZip";

interface ExportDialogDispatchProps {
    closeDialog?: (key: string) => void;
}

interface ExportDialogProps {
    index: string;
    extension: LoadedExtension;
}

type ExportDialogMergedProps = ExportDialogProps & ExportDialogDispatchProps;

function ExportDialog({ closeDialog, extension, index }: ExportDialogMergedProps) {
    let ref: HTMLDivElement | null = null;

    function accept() {
        closeDialog && closeDialog(index);
        if (ref) {
            const exportedLanguages: WetLanguage[] = [];
            const inputs = ref.querySelectorAll("input");
            for (const input of inputs) {
                const language = input.checked && extension.languages[input.value];
                if (language)
                    exportedLanguages.push(language);
            }
            if (exportedLanguages.length)
                exportToZip(exportedLanguages, extension.mainLanguage);
        }
    }
    const checkboxes = Object.getOwnPropertyNames(extension.languages).map((locale) => <label key={locale} className="export-dialog__checkbox-label">
        <input type="checkbox" value={locale} defaultChecked={true} />
        {extension.languages[locale].label}
    </label>);

    function cancel() {
        closeDialog && closeDialog(index);
    }

    function onRef(e: HTMLDivElement | null) {
        ref = e;
    }

    const buttons = [
        { label: "OK", focus: true, onClick: accept },
        { label: "Cancel", focus: false, onClick: cancel }
    ];
    return <Dialog className="export-dialog" title={"Export Translations"} buttons={buttons}>
        <div ref={onRef}>{checkboxes}</div>
    </Dialog>;
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {
        closeDialog: (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key })
    };
}

const ConnectedExportDialog = connect<{}, ExportDialogDispatchProps, ExportDialogProps>(null, mapDispatchToProps)(ExportDialog);
export default ConnectedExportDialog;

export function createExportDialog(extension: LoadedExtension) {
    const index = getNewDialogIndex().toString();
    return <ConnectedExportDialog key={index} index={index} extension={extension} />;
}
