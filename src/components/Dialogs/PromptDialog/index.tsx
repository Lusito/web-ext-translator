import React, { useRef, useEffect } from "react";

import Dialog from "../Dialog";
import Markdown from "../../Markdown";
import "./style.css";

interface PromptValidationResult {
    valid: boolean;
    message: string;
}

interface PromptDialogProps {
    title: string;
    text?: string;
    initialValue?: string;
    placeholder?: string;
    validate?: (value: string) => PromptValidationResult;
    onAccept: (value: string) => void;
    onCancel: () => void;
}

export default ({ title, text, initialValue, placeholder, validate, onAccept, onCancel }: PromptDialogProps) => {
    const input = useRef<HTMLInputElement>(null);
    const hint = useRef<HTMLDivElement>(null);
    function onChange() {
        if (validate && input.current && hint.current) {
            const result = validate(input.current.value);
            if (result.valid) hint.current.classList.remove("prompt-dialog__hint--is-invalid");
            else hint.current.classList.add("prompt-dialog__hint--is-invalid");
            hint.current.textContent = result.message;
        }
    }

    function accept() {
        if (!input.current) return;
        if (!validate || validate(input.current.value).valid) onAccept(input.current.value);
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.stopPropagation();
            e.preventDefault();
            accept();
        }
    }

    useEffect(onChange, []);

    const buttons = [
        { label: "OK", focus: false, onClick: accept },
        { label: "Cancel", focus: false, onClick: onCancel },
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
};
