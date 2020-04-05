import React, { useRef } from "react";

import Dialog from "../Dialog";
import { getNewDialogIndex } from "..";
import { useCloseDialog } from "../../../hooks";
import "./style.css";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectDialogProps {
    index: string;
    title: string;
    options: SelectOption[];
    initialValue: string;
    onAccept?: (value: string) => void;
    onCancel?: () => void;
}

function SelectDialog({ title, options, initialValue, onAccept, onCancel, index }: SelectDialogProps) {
    const select = useRef<HTMLSelectElement>();
    const closeDialog = useCloseDialog();

    function accept() {
        if (select) {
            closeDialog(index);
            onAccept?.(select.current.value);
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
        <Dialog className="select-dialog" title={title || ""} buttons={buttons}>
            <select ref={select} className="select-dialog__select" value={initialValue} autoFocus>
                {options.map((option) => (
                    <option value={option.value}>{option.label}</option>
                ))}
            </select>
        </Dialog>
    );
}

export default SelectDialog;

export function createSelectDialog(
    title: string,
    options: SelectOption[],
    initialValue: string,
    onAccept: (value: string) => void,
    onCancel?: () => void
) {
    const index = getNewDialogIndex().toString();
    return (
        <SelectDialog
            key={index}
            index={index}
            title={title}
            options={options}
            initialValue={initialValue}
            onAccept={onAccept}
            onCancel={onCancel}
        />
    );
}
