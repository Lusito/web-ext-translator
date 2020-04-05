import React from "react";

import Dialog from "../Dialog";
import { getNewDialogIndex } from "..";
import { useCloseDialog } from "../../../hooks";
import "./style.css";

interface ConfirmDialogProps {
    index: string;
    title: string;
    message: string;
    onAccept: () => void;
    onCancel?: () => void;
}

function ConfirmDialog({ title, message, onAccept, onCancel, index }: ConfirmDialogProps) {
    const closeDialog = useCloseDialog();
    function accept() {
        closeDialog(index);
        onAccept?.();
    }
    function cancel() {
        closeDialog(index);
        onCancel?.();
    }
    const buttons = [
        { label: "OK", focus: true, onClick: accept },
        { label: "Cancel", onClick: cancel },
    ];
    return (
        <Dialog className="confirm-dialog" title={title || ""} buttons={buttons}>
            {message || ""}
        </Dialog>
    );
}

export default ConfirmDialog;

export function createConfirmDialog(title: string, message: string, onAccept: () => void, onCancel?: () => void) {
    const index = getNewDialogIndex().toString();
    return (
        <ConfirmDialog
            key={index}
            index={index}
            title={title}
            message={message}
            onAccept={onAccept}
            onCancel={onCancel}
        />
    );
}
