import React from "react";

import Dialog from "../Dialog";
import "./style.css";

interface ConfirmDialogProps {
    title: string;
    message: string;
    onAccept: () => void;
    onCancel: () => void;
}

export default ({ title, message, onAccept, onCancel }: ConfirmDialogProps) => {
    const buttons = [
        { label: "OK", focus: true, onClick: onAccept },
        { label: "Cancel", onClick: onCancel },
    ];
    return (
        <Dialog className="confirm-dialog" title={title || ""} buttons={buttons}>
            {message || ""}
        </Dialog>
    );
};
