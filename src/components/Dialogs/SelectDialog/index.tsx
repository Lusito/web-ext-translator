import React, { useRef } from "react";

import Dialog from "../Dialog";
import "./style.css";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectDialogProps {
    title: string;
    options: SelectOption[];
    initialValue: string;
    onAccept: (value: string) => void;
    onCancel: () => void;
}

export default ({ title, options, initialValue, onAccept, onCancel }: SelectDialogProps) => {
    const select = useRef<HTMLSelectElement>();

    const buttons = [
        { label: "OK", focus: false, onClick: () => onAccept(select.current.value) },
        { label: "Cancel", focus: false, onClick: onCancel },
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
};
