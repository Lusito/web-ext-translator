import * as React from "react";
import "./style.css";
import Dialog from "../Dialog";
import { State } from "../../../shared";
import { Dispatch, connect } from "react-redux";
import { WetAction } from "../../../actions";
import { getNewDialogIndex } from "../../Dialogs";

interface FileDialogStateProps {
    closeDialog?: (key: string) => void;
}

interface FileDialogProps {
    index: string;
    title: string;
    onAccept?: (value: FileList) => void;
    onCancel?: () => void;
}

function FileDialog({ title, onAccept, onCancel, closeDialog, index }: FileDialogProps & FileDialogStateProps) {
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

function mapStateToProps({ }: State) {
    return {};
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {
        closeDialog: (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key })
    };
}

const ConnectedFileDialog = connect<FileDialogStateProps>(mapStateToProps, mapDispatchToProps)(FileDialog);
export default ConnectedFileDialog;

export function createFileDialog(title: string, onAccept: (value: FileList) => void, onCancel?: () => void) {
    const index = getNewDialogIndex().toString();
    return <ConnectedFileDialog key={index} index={index} title={title} onAccept={onAccept} onCancel={onCancel} />;
}
