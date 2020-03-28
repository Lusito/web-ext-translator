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

interface ConfirmDialogDispatchProps {
    closeDialog?: (key: string) => void;
}

interface ConfirmDialogProps {
    index: string;
    title: string;
    message: string;
    onAccept: () => void;
    onCancel?: () => void;
}

type ConfirmDialogMergedProps = ConfirmDialogProps & ConfirmDialogDispatchProps;

function ConfirmDialog({ title, message, onAccept, onCancel, closeDialog, index }: ConfirmDialogMergedProps) {
    function accept() {
        closeDialog && closeDialog(index);
        onAccept && onAccept();
    }
    function cancel() {
        closeDialog && closeDialog(index);
        onCancel && onCancel();
    }
    const buttons = [{ label: "OK", focus: true, onClick: accept }, { label: "Cancel", onClick: cancel }];
    return <Dialog className="confirm-dialog" title={title || ""} buttons={buttons}>{message || ""}</Dialog>;
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {
        closeDialog: (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key })
    };
}

const ConnectedConfirmDialog = connect<{}, ConfirmDialogDispatchProps, ConfirmDialogProps>(null, mapDispatchToProps)(ConfirmDialog);
export default ConnectedConfirmDialog;

export function createConfirmDialog(title: string, message: string, onAccept: () => void, onCancel?: () => void) {
    const index = getNewDialogIndex().toString();
    return <ConnectedConfirmDialog key={index} index={index} title={title} message={message} onAccept={onAccept} onCancel={onCancel} />;
}
