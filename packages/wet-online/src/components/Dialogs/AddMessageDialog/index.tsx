import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "@react-nano/redux";

import Dialog from "../Dialog";
import { selectExtension, addMessage } from "../../../redux/extension";
import { useSetDirty } from "../../../hooks";
import "./style.css";

const VALID_NAME = /^[A-Za-z0-9_@]+$/;

interface AddMessageDialogProps {
    messageName: string;
    onClose: () => void;
}

export default ({ messageName, onClose }: AddMessageDialogProps) => {
    const setDirty = useSetDirty();
    const dispatch = useDispatch();
    const extension = useSelector(selectExtension);
    const input = useRef<HTMLInputElement>(null);
    const asGroup = useRef<HTMLInputElement>(null);
    const insertBefore = useRef<HTMLInputElement>(null);
    const hint = useRef<HTMLDivElement>(null);
    let value = "";
    const existingNames = extension ? Object.getOwnPropertyNames(extension.mainLanguage.messagesByKey) : [];

    function validate() {
        if (!value.length) {
            return { valid: false, message: "Please enter a name" };
        }
        if (!asGroup.current?.checked) {
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
        if (!input.current || !hint.current) return;
        value = input.current.value;
        if (hint) {
            const result = validate();
            if (result.valid) hint.current.classList.remove("add-message-dialog__hint--is-invalid");
            else hint.current.classList.add("add-message-dialog__hint--is-invalid");
            hint.current.textContent = result.message;
        }
    }

    function accept() {
        if (asGroup.current && insertBefore.current && validate().valid) {
            onClose();
            dispatch(addMessage(asGroup.current.checked, insertBefore.current.checked, messageName, value));
            setDirty(true);
        }
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
        { label: "Cancel", focus: false, onClick: onClose },
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
};
