/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import Dialog from "../Dialog";
import { WetAction } from "../../../actions";
import { getNewDialogIndex } from "..";
import Markdown from "../../Markdown";

interface AlertDialogDispatchProps {
    closeDialog?: (key: string) => void;
}

interface AlertDialogProps {
    index: string;
    title: string;
    message: string;
    onClose?: () => void;
}

type AlertDialogMergedProps = AlertDialogProps & AlertDialogDispatchProps;

function AlertDialog({ title, message, onClose, closeDialog, index }: AlertDialogMergedProps) {
    function close() {
        closeDialog?.(index);
        onClose?.();
    }
    const buttons = [{ label: "OK", focus: true, onClick: close }];
    return (
        <Dialog className="alert-dialog" title={title || ""} buttons={buttons}>
            <Markdown markdown={message || ""} />
        </Dialog>
    );
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {
        closeDialog: (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key }),
    };
}

const ConnectedAlertDialog = connect<{}, AlertDialogDispatchProps, AlertDialogProps>(
    null,
    mapDispatchToProps
)(AlertDialog);
export default ConnectedAlertDialog;

export function createAlertDialog(title: string, message: string, onClose?: () => void) {
    const index = getNewDialogIndex().toString();
    return <ConnectedAlertDialog key={index} index={index} title={title} message={message} onClose={onClose} />;
}
