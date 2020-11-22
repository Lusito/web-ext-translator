import React, { useRef } from "react";

import Dialog from "../Dialog";
import "./style.css";

interface FileDialogProps {
    title: string;
    onAccept: (value: FileList) => void;
    onCancel: () => void;
}

export default ({ title, onAccept, onCancel }: FileDialogProps) => {
    const input = useRef<HTMLInputElement>(null);

    function accept() {
        if (input.current?.files) {
            onAccept(input.current.files);
        }
    }

    const buttons = [
        { label: "OK", focus: false, onClick: accept },
        { label: "Cancel", focus: false, onClick: onCancel },
    ];
    return (
        <Dialog className="file-dialog" title={title || ""} buttons={buttons}>
            <input ref={input} type="file" className="file-dialog__input" autoFocus />
        </Dialog>
    );
};
