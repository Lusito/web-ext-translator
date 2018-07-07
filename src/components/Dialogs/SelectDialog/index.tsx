import * as React from "react";
import "./style.css";
import Dialog from "../Dialog";
import { State } from "../../../shared";
import { Dispatch, connect } from "react-redux";
import { WetAction } from "../../../actions";
import { getNewDialogIndex } from "../../Dialogs";

interface SelectDialogStateProps {
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

function SelectDialog({ title, options, initialValue, onAccept, onCancel, closeDialog, index }: SelectDialogProps & SelectDialogStateProps) {
    let selectRef: HTMLSelectElement | null = null;

    function accept() {
        if (selectRef) {
            closeDialog && closeDialog(index);
            onAccept && onAccept(selectRef.value);
        }
    }

    function cancel() {
        closeDialog && closeDialog(index);
        onCancel && onCancel();
    }

    function onSelectRef(e: HTMLSelectElement | null) {
        if (e) {
            e.focus();
            selectRef = e;
        }
    }

    const buttons = [{ label: "OK", focus: false, onClick: accept }, { label: "Cancel", focus: false, onClick: cancel }];
    return <Dialog className="select-dialog" title={title || ""} buttons={buttons}>
        <select ref={onSelectRef} className="select-dialog__select" value={initialValue}>
            {options.map((option) => <option value={option.value}>{option.label}</option>)}
        </select>
    </Dialog>;
}

function mapStateToProps({ }: State) {
    return {};
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {
        closeDialog: (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key })
    };
}

const ConnectedSelectDialog = connect<SelectDialogStateProps>(mapStateToProps, mapDispatchToProps)(SelectDialog);
export default ConnectedSelectDialog;

export function createSelectDialog(title: string, options: SelectOption[], initialValue: string, onAccept: (value: string) => void, onCancel?: () => void) {
    const index = getNewDialogIndex().toString();
    return <ConnectedSelectDialog key={index} index={index} title={title} options={options} initialValue={initialValue} onAccept={onAccept} onCancel={onCancel} />;
}
