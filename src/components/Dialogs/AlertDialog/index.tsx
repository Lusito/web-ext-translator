import React from "react";

import Dialog from "../Dialog";
import Markdown from "../../Markdown";

interface AlertDialogProps {
    title: string;
    message: string;
    onClose: () => void;
}

export default ({ title, message, onClose }: AlertDialogProps) => {
    const buttons = [{ label: "OK", focus: true, onClick: onClose }];
    return (
        <Dialog className="alert-dialog" title={title || ""} buttons={buttons}>
            <Markdown markdown={message || ""} />
        </Dialog>
    );
};
