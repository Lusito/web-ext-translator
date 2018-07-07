import * as React from "react";
import "./style.css";
import Dialog from "../Dialog";
import { State } from "../../../shared";
import { Dispatch, connect } from "react-redux";
import { WetAction } from "../../../actions";
import { getNewDialogIndex } from "../../Dialogs";
import { renderMarkdown } from "../../MarkdownPreview";

interface AlertDialogStateProps {
    closeDialog?: (key: string) => void;
}

interface AlertDialogProps {
    index: string;
    title: string;
    message: string;
    onClose?: () => void;
}

function AlertDialog({ title, message, onClose, closeDialog, index }: AlertDialogProps & AlertDialogStateProps) {
    function close() {
        closeDialog && closeDialog(index);
        onClose && onClose();
    }
    const buttons = [{ label: "OK", focus: true, onClick: close }];
    return <Dialog className="alert-dialog" title={title || ""} buttons={buttons}>
        <div dangerouslySetInnerHTML={{ __html: (message ? renderMarkdown(message) : "") }}></div>
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

const ConnectedAlertDialog = connect<AlertDialogStateProps>(mapStateToProps, mapDispatchToProps)(AlertDialog);
export default ConnectedAlertDialog;

export function createAlertDialog(title: string, message: string, onClose?: () => void) {
    const index = getNewDialogIndex().toString();
    return <ConnectedAlertDialog key={index} index={index} title={title} message={message} onClose={onClose} />;
}
