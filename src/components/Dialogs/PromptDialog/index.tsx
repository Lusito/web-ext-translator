import * as React from "react";
import "./style.css";
import Dialog from "../Dialog";
import { State } from "../../../shared";
import { Dispatch, connect } from "react-redux";
import { WetAction } from "../../../actions";
import { getNewDialogIndex } from "../../Dialogs";
import { renderMarkdown } from "../../MarkdownPreview";

interface PromptDialogStateProps {
    closeDialog?: (key: string) => void;
}

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

function PromptDialog({ title, text, initialValue, placeholder, validate, onAccept, onCancel, closeDialog, index }: PromptDialogProps & PromptDialogStateProps) {
    let inputRef: HTMLInputElement | null = null;
    let hintRef: HTMLDivElement | null = null;
    let value = initialValue;
    function onChange() {
        if (inputRef) {
            value = inputRef.value;
            if (hintRef && validate) {
                const result = validate(value);
                if (result.valid)
                    hintRef.classList.remove("is-invalid");
                else
                    hintRef.classList.add("is-invalid");
                hintRef.textContent = result.message;
            }
        }
    }

    function accept() {
        if (!validate || validate(value).valid) {
            closeDialog && closeDialog(index);
            onAccept && onAccept(value);
        }
    }

    function cancel() {
        closeDialog && closeDialog(index);
        onCancel && onCancel();
    }

    function onInputRef(e: HTMLInputElement | null) {
        if (e) {
            e.value = initialValue;
            e.focus();
            inputRef = e;
            onChange();
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
    return <Dialog className="prompt-dialog" title={title || ""} buttons={buttons}>
        { text ? <div className="prompt-dialog__text" dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}></div> : "" }
        <input ref={onInputRef} onChange={onChange} onKeyDown={onKeyDown} className="prompt-dialog__input" placeholder={placeholder} />
        <div ref={onHintRef} className="prompt-dialog__hint"></div>
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

const ConnectedPromptDialog = connect<PromptDialogStateProps>(mapStateToProps, mapDispatchToProps)(PromptDialog);
export default ConnectedPromptDialog;

export function createPromptDialog(title: string, text: string, initialValue: string, placeholder: string, onAccept: (value: string) => void, validate?: (value: string) => PromptValidationResult, onCancel?: () => void) {
    const index = getNewDialogIndex().toString();
    return <ConnectedPromptDialog key={index} index={index} title={title} text={text} initialValue={initialValue} placeholder={placeholder} onAccept={onAccept} validate={validate} onCancel={onCancel} />;
}
