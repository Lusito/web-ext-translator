import React from "react";

import Dialog from "../Dialog";
import { getNewDialogIndex } from "..";
import Markdown from "../../Markdown";
import { useCloseDialog } from "../../../hooks";

interface AlertDialogProps {
    index: string;
    title: string;
    message: string;
    onClose?: () => void;
}

function AlertDialog({ title, message, onClose, index }: AlertDialogProps) {
    const closeDialog = useCloseDialog();
    function close() {
        closeDialog(index);
        onClose?.();
    }
    const buttons = [{ label: "OK", focus: true, onClick: close }];
    return (
        <Dialog className="alert-dialog" title={title || ""} buttons={buttons}>
            <Markdown markdown={message || ""} />
        </Dialog>
    );
}

export default AlertDialog;

export function createAlertDialog(title: string, message: string, onClose?: () => void) {
    const index = getNewDialogIndex().toString();
    return <AlertDialog key={index} index={index} title={title} message={message} onClose={onClose} />;
}
