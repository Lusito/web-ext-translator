/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React, { useRef } from "react";

import Dialog from "../Dialog";
import { getNewDialogIndex } from "..";
import Markdown from "../../Markdown";
import useCloseDialog from "../useCloseDialog";
import "./style.css";

interface PromptValidationResult {
    valid: boolean;
    message: string;
}

interface PromptDialogProps {
    index: string;
    title: string;
    text: string;
    initialValue: string;
    placeholder?: string;
    validate?: (value: string) => PromptValidationResult;
    onAccept?: (value: string) => void;
    onCancel?: () => void;
}

function PromptDialog({
    title,
    text,
    initialValue,
    placeholder,
    validate,
    onAccept,
    onCancel,
    index,
}: PromptDialogProps) {
    const closeDialog = useCloseDialog();
    const input = useRef<HTMLInputElement>();
    const hint = useRef<HTMLDivElement>();
    let value = initialValue;
    function onChange() {
        value = input.current.value;
        if (validate) {
            const result = validate(value);
            if (result.valid) hint.current.classList.remove("prompt-dialog__hint--is-invalid");
            else hint.current.classList.add("prompt-dialog__hint--is-invalid");
            hint.current.textContent = result.message;
        }
    }

    function accept() {
        if (!validate || validate(value).valid) {
            closeDialog(index);
            onAccept?.(value);
        }
    }

    function cancel() {
        closeDialog(index);
        onCancel?.();
    }

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
        <Dialog className="prompt-dialog" title={title || ""} buttons={buttons}>
            {text ? <Markdown className="prompt-dialog__text" markdown={text} /> : ""}
            <input
                ref={input}
                defaultValue={initialValue}
                onChange={onChange}
                onKeyDown={onKeyDown}
                className="prompt-dialog__input"
                placeholder={placeholder}
                autoFocus
            />
            <div ref={hint} className="prompt-dialog__hint" />
        </Dialog>
    );
}

export default PromptDialog;

export function createPromptDialog(
    title: string,
    text: string,
    initialValue: string,
    placeholder: string,
    onAccept: (value: string) => void,
    validate?: (value: string) => PromptValidationResult,
    onCancel?: () => void
) {
    const index = getNewDialogIndex().toString();
    return (
        <PromptDialog
            key={index}
            index={index}
            title={title}
            text={text}
            initialValue={initialValue}
            placeholder={placeholder}
            onAccept={onAccept}
            validate={validate}
            onCancel={onCancel}
        />
    );
}
