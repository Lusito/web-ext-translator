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
import "./style.css";

interface SelectDialogDispatchProps {
    closeDialog?: (key: string) => void;
}

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

type SelectDialogMergedProps = SelectDialogProps & SelectDialogDispatchProps;

function SelectDialog({
    title,
    options,
    initialValue,
    onAccept,
    onCancel,
    closeDialog,
    index,
}: SelectDialogMergedProps) {
    let selectRef: HTMLSelectElement | null = null;

    function accept() {
        if (selectRef) {
            closeDialog?.(index);
            onAccept?.(selectRef.value);
        }
    }

    function cancel() {
        closeDialog?.(index);
        onCancel?.();
    }

    function onSelectRef(e: HTMLSelectElement | null) {
        if (e) {
            e.focus();
            selectRef = e;
        }
    }

    const buttons = [
        { label: "OK", focus: false, onClick: accept },
        { label: "Cancel", focus: false, onClick: cancel },
    ];
    return (
        <Dialog className="select-dialog" title={title || ""} buttons={buttons}>
            <select ref={onSelectRef} className="select-dialog__select" value={initialValue}>
                {options.map((option) => (
                    <option value={option.value}>{option.label}</option>
                ))}
            </select>
        </Dialog>
    );
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {
        closeDialog: (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key }),
    };
}

const ConnectedSelectDialog = connect<{}, SelectDialogDispatchProps, SelectDialogProps>(
    null,
    mapDispatchToProps
)(SelectDialog);
export default ConnectedSelectDialog;

export function createSelectDialog(
    title: string,
    options: SelectOption[],
    initialValue: string,
    onAccept: (value: string) => void,
    onCancel?: () => void
) {
    const index = getNewDialogIndex().toString();
    return (
        <ConnectedSelectDialog
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
