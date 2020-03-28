/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

interface SearchConfig {
    element: Element;
    offset: number;
    searchableElements: Element[];
}

const currentData: SearchConfig = {
    element: document.body,
    offset: 0,
    searchableElements: []
};

function updateSearchConfig() {
    currentData.searchableElements = [...document.querySelectorAll(".translation-table-body__th:first-child, .translation-table-body__td:first-child, .translation-editor")];

    let isDone = false;
    currentData.element = currentData.searchableElements[0];
    currentData.offset = 0;
    const selection = window.getSelection();
    if (selection && selection.anchorNode && selection.anchorNode.nodeType === 3) {
        const el = selection.anchorNode.parentElement;
        if (el && el.className.includes("translation-table-body__")) {
            currentData.element = el;
            currentData.offset = selection.anchorOffset;
            isDone = true;
        }
    }
    if (!isDone && document.activeElement && document.activeElement.tagName === "TEXTAREA") {
        currentData.element = document.activeElement;
        currentData.offset = (document.activeElement as HTMLTextAreaElement).selectionStart;
    }
}

function getTextAreaRect(textArea: HTMLElement) {
    let x = 0;
    let y = 0;
    let el = textArea;
    while (!el.classList.contains("translation-table-body")) {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
        el = el.offsetParent as HTMLElement;
    }
    return { top: y, left: x, width: textArea.clientWidth, height: textArea.clientHeight };
}

function setSelection(start: number, length: number) {
    if (currentData.element.tagName === "TEXTAREA") {
        const textArea = (currentData.element as HTMLTextAreaElement);
        textArea.focus();
        textArea.setSelectionRange(start, start + length);
        const rect = getTextAreaRect(textArea);
        const pre = document.createElement("pre");
        pre.textContent = textArea.value.substr(0, start);
        pre.style.position = "absolute";
        pre.style.margin = "0";
        pre.style.padding = "5px";
        pre.style.boxSizing = "border-box";
        pre.style.font = "14px monospace";
        pre.style.whiteSpace = "pre-wrap";
        for (const key in rect)
            pre.style[key as keyof typeof rect] = `${rect[key as keyof typeof rect]}px`;
        pre.style.height = "auto";
        const body = document.querySelector(".translation-table-body") as HTMLElement;
        body.appendChild(pre);
        body.scrollTop = pre.clientHeight + rect.top - body.clientHeight / 2;
        body.removeChild(pre);
    } else {
        const node = currentData.element.firstChild;
        if (node) {
            const range = document.createRange();
            range.setStart(node, start);
            range.setEnd(node, start + length);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            currentData.element.scrollIntoView();
        }
    }
}

function getNextSearchable() {
    currentData.offset = 0;
    const index = currentData.searchableElements.indexOf(currentData.element);
    if (index === -1) { return currentData.searchableElements[0]; }
    return currentData.searchableElements[index + 1];
}

function searchNextIn(element: Element, offset: number, text: string) {
    const index = (element.textContent || "").toLowerCase().indexOf(text, offset);
    if (index === -1) {
        return false;
    }
    setSelection(index, text.length);
    return true;
}

export function searchNext(text: string, force: boolean) {
    text = text.toLowerCase();
    updateSearchConfig();
    if (force) {
        currentData.offset += 1;
    }
    const firstElement = currentData.element;
    while (!searchNextIn(currentData.element, currentData.offset, text)) {
        const element = getNextSearchable();
        if (element) {
            currentData.element = element;
            continue;
        }

        currentData.element = currentData.searchableElements[0];
        currentData.offset = 0;

        while (!searchNextIn(currentData.element, currentData.offset, text) && currentData.element !== firstElement) {
            const element = getNextSearchable();
            if (!element) {
                break;
            }
            currentData.element = element;
        }
        return;
    }
}

function getPrevSearchable() {
    const index = currentData.searchableElements.indexOf(currentData.element);
    let el = currentData.searchableElements[index - 1];
    if (index === -1) { el = currentData.searchableElements[currentData.searchableElements.length - 1]; }
    if (el)
        currentData.offset = (el.textContent || "").length;
    return el;
}

function searchPrevIn(element: Element, offset: number, text: string) {
    const index = (element.textContent || "").substr(0, offset + text.length - 1).toLowerCase().lastIndexOf(text);
    if (index === -1) {
        return false;
    }
    setSelection(index, text.length);
    return true;
}

export function searchPrev(text: string) {
    text = text.toLowerCase();
    updateSearchConfig();
    const firstElement = currentData.element;
    while (!searchPrevIn(currentData.element, currentData.offset, text)) {
        const element = getPrevSearchable();
        if (element) {
            currentData.element = element;
            continue;
        }

        currentData.element = currentData.searchableElements[currentData.searchableElements.length - 1];
        currentData.offset = (currentData.element.textContent || "").length;

        while (!searchPrevIn(currentData.element, currentData.offset, text) && currentData.element !== firstElement) {
            const element = getPrevSearchable();
            if (!element)
                break;
            currentData.element = element;
        }
        return;
    }
}
