/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import "./style.css";
import Dialog from "../Dialog";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { WetAction } from "../../../actions";
import { getNewDialogIndex } from "../../Dialogs";

interface FileDialogDispatchProps {
    closeDialog?: (key: string) => void;
}

interface FileDialogProps {
    index: string;
    title: string;
    onAccept?: (value: FileList) => void;
    onCancel?: () => void;
}

type FileDialogMergedProps = FileDialogProps & FileDialogDispatchProps;

function FileDialog({ title, onAccept, onCancel, closeDialog, index }: FileDialogMergedProps) {
    let inputRef: HTMLInputElement | null = null;

    function accept() {
        if (inputRef && inputRef.files) {
            closeDialog && closeDialog(index);
            onAccept && onAccept(inputRef.files);
        }
    }

    function cancel() {
        closeDialog && closeDialog(index);
        onCancel && onCancel();
    }

    function onInputRef(e: HTMLInputElement | null) {
        if (e) {
            e.focus();
            inputRef = e;
        }
    }

    const buttons = [{ label: "OK", focus: false, onClick: accept }, { label: "Cancel", focus: false, onClick: cancel }];
    return <Dialog className="file-dialog" title={title || ""} buttons={buttons}>
        <input ref={onInputRef} type="file" className="file-dialog__input" />
    </Dialog>;
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {
        closeDialog: (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key })
    };
}

const ConnectedFileDialog = connect<{}, FileDialogDispatchProps, FileDialogProps>(null, mapDispatchToProps)(FileDialog);
export default ConnectedFileDialog;

export function createFileDialog(title: string, onAccept: (value: FileList) => void, onCancel?: () => void) {
    const index = getNewDialogIndex().toString();
    return <ConnectedFileDialog key={index} index={index} title={title} onAccept={onAccept} onCancel={onCancel} />;
}
