import * as React from "react";
import "./style.css";
import Dialog from "../Dialog";
import { State } from "../../../shared";
import { Dispatch, connect } from "react-redux";
import { WetAction } from "../../../actions";
import { getNewDialogIndex } from "../../Dialogs";

interface ConfirmDialogStateProps {
    closeDialog?: (key: string) => void;
}

interface ConfirmDialogProps {
    index: string;
    title: string;
    message: string;
    onAccept: () => void;
    onCancel?: () => void;
}

function ConfirmDialog({ title, message, onAccept, onCancel, closeDialog, index }: ConfirmDialogProps & ConfirmDialogStateProps) {
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

function mapStateToProps({ }: State) {
    return {};
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {
        closeDialog: (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key })
    };
}

const ConnectedConfirmDialog = connect<ConfirmDialogStateProps>(mapStateToProps, mapDispatchToProps)(ConfirmDialog);
export default ConnectedConfirmDialog;

export function createConfirmDialog(title: string, message: string, onAccept: () => void, onCancel?: () => void) {
  const index = getNewDialogIndex().toString();
  return <ConnectedConfirmDialog key={index} index={index} title={title} message={message} onAccept={onAccept} onCancel={onCancel} />;
}
