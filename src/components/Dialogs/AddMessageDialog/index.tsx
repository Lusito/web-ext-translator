import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux-nano";

import Dialog from "../Dialog";
import { getNewDialogIndex } from "..";
import store from "../../../store";
import useCloseDialog from "../useCloseDialog";
import { selectExtension } from "../../../selectors";
import "./style.css";

const VALID_NAME = /^[A-Za-z0-9_@]+$/;

interface AddMessageDialogProps {
    index: string;
    messageName: string;
}

function AddMessageDialog({ messageName, index }: AddMessageDialogProps) {
    const extension = useSelector(selectExtension);
    const closeDialog = useCloseDialog();
    const input = useRef<HTMLInputElement>();
    const asGroup = useRef<HTMLInputElement>();
    const insertBefore = useRef<HTMLInputElement>();
    const hint = useRef<HTMLDivElement>();
    let value = "";
    const existingNames = extension ? Object.getOwnPropertyNames(extension.mainLanguage.messagesByKey) : [];

    function validate() {
        if (!value.length) {
            return { valid: false, message: "Please enter a name" };
        }
        if (!asGroup.current.checked) {
            if (existingNames.includes(value)) {
                return { valid: false, message: "Key already exists" };
            }
            if (value.startsWith("@@")) {
                return { error: true, message: "Keys starting with @@ are reserved!" };
            }
            if (!VALID_NAME.test(value)) {
                return { error: true, message: "Allowed characters: A-Z,a-z,0-9,_ (underscore) or @" };
            }
        }
        return { valid: true, message: "" };
    }
    function onChange() {
        value = input.current.value;
        if (hint) {
            const result = validate();
            if (result.valid) hint.current.classList.remove("add-message-dialog__hint--is-invalid");
            else hint.current.classList.add("add-message-dialog__hint--is-invalid");
            hint.current.textContent = result.message;
        }
    }

    function accept() {
        if (validate().valid) {
            closeDialog(index);
            store.dispatch({
                type: "ADD_MESSAGE",
                payload: {
                    asGroup: asGroup.current.checked,
                    insertBefore: insertBefore.current.checked,
                    referenceMessageName: messageName,
                    newMessageName: value,
                },
            });
        }
    }

    function cancel() {
        closeDialog(index);
    }

    useEffect(() => {
        onChange();
    }, []);

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.stopPropagation();
            e.preventDefault();
            accept();
        }
    }

    const buttons = [
        { label: "OK", focus: false, onClick: accept },
        { label: "Cancel", focus: false, onClick: cancel },
    ];
    return (
        <Dialog className="add-message-dialog" title="Insert a new Message" buttons={buttons}>
            <div>
                <label>
                    <input type="checkbox" ref={asGroup} onClick={onChange} /> As group/comment
                </label>
            </div>
            <div>
                <label>
                    <input type="checkbox" ref={insertBefore} /> Insert before current element
                </label>
            </div>
            <input
                ref={input}
                onChange={onChange}
                onKeyDown={onKeyDown}
                className="add-message-dialog__input"
                placeholder="Name.."
                autoFocus
            />
            <div ref={hint} className="add-message-dialog__hint" />
        </Dialog>
    );
}

export default AddMessageDialog;

export function createAddMessageDialog(messageName: string) {
    const index = getNewDialogIndex().toString();
    return <AddMessageDialog key={index} index={index} messageName={messageName} />;
}
