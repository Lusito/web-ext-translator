/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React, { useRef } from "react";

import Dialog from "../Dialog";
import { getNewDialogIndex } from "..";
import useCloseDialog from "../useCloseDialog";
import "./style.css";

interface FileDialogProps {
    index: string;
    title: string;
    onAccept?: (value: FileList) => void;
    onCancel?: () => void;
}

function FileDialog({ title, onAccept, onCancel, index }: FileDialogProps) {
    const closeDialog = useCloseDialog();
    const input = useRef<HTMLInputElement>();

    function accept() {
        if (input.current.files) {
            closeDialog(index);
            onAccept?.(input.current.files);
        }
    }

    function cancel() {
        closeDialog(index);
        onCancel?.();
    }

    const buttons = [
        { label: "OK", focus: false, onClick: accept },
        { label: "Cancel", focus: false, onClick: cancel },
    ];
    return (
        <Dialog className="file-dialog" title={title || ""} buttons={buttons}>
            <input ref={input} type="file" className="file-dialog__input" autoFocus />
        </Dialog>
    );
}

export default FileDialog;

export function createFileDialog(title: string, onAccept: (value: FileList) => void, onCancel?: () => void) {
    const index = getNewDialogIndex().toString();
    return <FileDialog key={index} index={index} title={title} onAccept={onAccept} onCancel={onCancel} />;
}
