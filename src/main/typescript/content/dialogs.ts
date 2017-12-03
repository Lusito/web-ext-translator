/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/forget-me-not
 */

import { Key } from 'ts-keycode-enum';
import { MouseEventCallback, createButton, on, createElement } from "./htmlUtils";

const escapeListeners: (() => void)[] = [];
on(document, 'keyup', (e) => {
    if (escapeListeners.length && e.keyCode === Key.Escape)
        escapeListeners[escapeListeners.length - 1]();
})

export function createDialog(className: string, title: string, buttons: { [s: string]: MouseEventCallback }, onEscape: () => void) {
    let overlay = createElement(document.body, 'div', { className: 'dialogOverlay' });
    let dialog = createElement(overlay, 'div', { className: 'dialog ' + className });
    createElement(dialog, 'h2', { textContent: title });
    let contentNode = createElement(dialog, 'div', { className: 'dialogContent' });
    let buttonsNode = createElement(dialog, 'div', { className: 'dialogButtons' });
    let buttonNodes: { [s: string]: HTMLButtonElement } = {};

    for (let key in buttons)
        buttonNodes[key] = createButton(buttonsNode, key, buttons[key]);
    escapeListeners.push(onEscape);
    return {
        domNode: dialog,
        contentNode: contentNode,
        buttonNodes: buttonNodes,
        close: () => {
            document.body.removeChild(overlay);
            escapeListeners.pop();
        }
    };
}

export function alert(title: string, content?: string, callback?: () => void) {
    function onOK() {
        dialog.close();
        if (callback)
            callback();
    }
    let dialog = createDialog('alert', title, {
        'OK': onOK
    }, onOK);
    if (content)
        dialog.contentNode.textContent = content;
    dialog.buttonNodes.OK.focus();
}

export function confirm(title: string, content: string | null, callback: (value: boolean) => void) {
    function onCancel() {
        dialog.close();
        callback(false);
    }
    let dialog = createDialog('confirm', title, {
        'OK': () => {
            dialog.close();
            callback(true);
        },
        'Cancel': onCancel
    }, onCancel);
    if (content)
        dialog.contentNode.textContent = content;
    dialog.buttonNodes.OK.focus();
}

export function prompt(title: string, value: string, callback: (value: string | null) => void) {
    function onOK() {
        dialog.close();
        callback(input.value);
    }
    function onCancel() {
        dialog.close();
        callback(null);
    }
    let input = document.createElement('input');
    input.value = value;
    let dialog = createDialog('prompt', title, {
        'OK': onOK,
        'Cancel': onCancel
    }, onCancel);
    dialog.contentNode.appendChild(input);
    input.focus();
    on(input, 'keyup', (e) => e.keyCode === Key.Enter && onOK());
}

export interface PromptValidationResult {
    error?: boolean;
    message: string;
}

export function promptValidated(title: string, value: string, validationCallback: (value: string) => PromptValidationResult, callback: (value: string | null) => void) {
    let input = document.createElement('input');
    input.value = value;
    let latestResult: string;
    function onOK() {
        if (latestResult) {
            dialog.close();
            callback(latestResult);
        }
    }
    function onCancel() {
        dialog.close();
        callback(null);
    }
    let dialog = createDialog('prompt', title, {
        'OK': onOK,
        'Cancel': onCancel
    }, onCancel);
    dialog.contentNode.appendChild(input);
    const label = createElement(dialog.contentNode, 'div');
    input.focus();
    on(input, 'keyup', (e) => {
        if (e.keyCode === 13)
            onOK();
    });
    const updateLabel = () => {
        const result = validationCallback(input.value);
        if (result.error) {
            latestResult = '';
            label.textContent = result.message;
            label.style.color = 'darkred';
        } else {
            latestResult = input.value;
            label.textContent = result.message;
            label.style.color = '';
        }
    };
    on(input, 'input', updateLabel);
    updateLabel();
}
