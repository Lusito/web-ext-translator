/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/forget-me-not
 */

export function byId(id: string) {
    return document.getElementById(id);
}

export function on<K extends keyof HTMLElementEventMap>(node: Node, event: K, callback: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any) {
    node.addEventListener(event, callback);
}

export function removeAllChildren(node: HTMLElement) {
    if (node.hasChildNodes()) {
        while (node.firstChild)
            node.removeChild(node.firstChild);
    }
}

type ElementAttributes = { [s: string]: string | number | boolean };

export function createElement(parent: HTMLElement | null, tagName: string, params?: ElementAttributes) {
    let e = document.createElement(tagName);
    if (params) {
        for (let key in params) {
            (e as any)[key] = params[key];
        }
    }
    if (parent)
        parent.appendChild(e);
    return e;
}

export type MouseEventCallback = (this: HTMLInputElement, ev: MouseEvent) => any;

export function createButton(parent: HTMLElement | null, label: string, callback: MouseEventCallback) {
    let button = createElement(parent, 'button', { textContent: label }) as HTMLButtonElement;
    on(button, 'click', callback);
    return button;
}
