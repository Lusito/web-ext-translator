/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import "./style.css";
import Dialog from "../Dialog";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { WetAction } from "../../../actions";
import { getNewDialogIndex } from "../../Dialogs";
import store from "../../../store";

const VALID_NAME = /^[A-Za-z0-9_@]+$/;

interface AddMessageDialogDispatchProps {
    closeDialog?: (key: string) => void;
}

interface AddMessageDialogProps {
    index: string;
    messageName: string;
}

type AddMessageDialogMergedProps = AddMessageDialogProps & AddMessageDialogDispatchProps;

function AddMessageDialog({ messageName, closeDialog, index }: AddMessageDialogMergedProps) {
    let inputRef: HTMLInputElement | null = null;
    let asGroupRef: HTMLInputElement | null = null;
    let insertBeforeRef: HTMLInputElement | null = null;
    let hintRef: HTMLDivElement | null = null;
    let value = "";
    const state = store.getState();
    const existingNames = state.extension ? Object.getOwnPropertyNames(state.extension.mainLanguage.messagesByKey) : [];

    function validate() {
        if (!value.length) {
            return { valid: false, message: "Please enter a name" };
        } else if (!asGroupRef || !asGroupRef.checked) {
            if (existingNames.indexOf(value) >= 0) {
                return { valid: false, message: "Key already exists" };
            } else if (value.startsWith("@@")) {
                return { error: true, message: "Keys starting with @@ are reserved!" };
            } else if (!VALID_NAME.test(value)) {
                return { error: true, message: "Allowed characters: A-Z,a-z,0-9,_ (underscore) or @" };
            }
        }
        return { valid: true, message: "" };
    }
    function onChange() {
        if (inputRef) {
            value = inputRef.value;
            if (hintRef) {
                const result = validate();
                if (result.valid)
                    hintRef.classList.remove("add-message-dialog__hint--is-invalid");
                else
                    hintRef.classList.add("add-message-dialog__hint--is-invalid");
                hintRef.textContent = result.message;
            }
        }
    }

    function accept() {
        if (validate().valid) {
            closeDialog && closeDialog(index);
            store.dispatch({
                type: "ADD_MESSAGE",
                payload: {
                    asGroup: !!asGroupRef && asGroupRef.checked,
                    insertBefore: !!insertBeforeRef && insertBeforeRef.checked,
                    referenceMessageName: messageName,
                    newMessageName: value
                }
            });
        }
    }

    function cancel() {
        closeDialog && closeDialog(index);
    }

    function onInputRef(e: HTMLInputElement | null) {
        if (e) {
            e.focus();
            inputRef = e;
            onChange();
        }
    }

    function onAsGroupRef(e: HTMLInputElement | null) {
        if (e) {
            asGroupRef = e;
        }
    }

    function onInsertBeforeRef(e: HTMLInputElement | null) {
        if (e) {
            insertBeforeRef = e;
        }
    }

    function onHintRef(e: HTMLDivElement | null) {
        if (e) {
            hintRef = e;
            onChange();
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.stopPropagation();
            e.preventDefault();
            accept();
        }
    }

    const buttons = [{ label: "OK", focus: false, onClick: accept }, { label: "Cancel", focus: false, onClick: cancel }];
    return <Dialog className="add-message-dialog" title="Insert a new Message" buttons={buttons}>
        <div><label><input type="checkbox" ref={onAsGroupRef} onClick={onChange} /> As group/comment</label></div>
        <div><label><input type="checkbox" ref={onInsertBeforeRef} /> Insert before current element</label></div>
        <input ref={onInputRef} onChange={onChange} onKeyDown={onKeyDown} className="add-message-dialog__input" placeholder="Name.." />
        <div ref={onHintRef} className="add-message-dialog__hint"></div>
    </Dialog>;
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {
        closeDialog: (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key })
    };
}

const ConnectedAddMessageDialog = connect<{}, AddMessageDialogDispatchProps, AddMessageDialogProps>(null, mapDispatchToProps)(AddMessageDialog);
export default ConnectedAddMessageDialog;

export function createAddMessageDialog(messageName: string) {
    const index = getNewDialogIndex().toString();
    return <ConnectedAddMessageDialog key={index} index={index} messageName={messageName} />;
}
