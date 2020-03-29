/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

const searchState = {
    text: "",
    index: 0,
    elements: [] as HTMLElement[],
    highlights: [] as HTMLElement[]
}

function resetHighlight() {
    searchState.highlights = [];
    for(const el of searchState.elements)
        el.textContent = el.dataset.searchable;
}
function addText(parent: HTMLElement, text: string) {
    parent.appendChild(document.createTextNode(text));
}
function addHighlight(parent: HTMLElement, text: string) {
    const span = document.createElement("span");
    span.className = "search-highlight";
    span.textContent = text;
    parent.appendChild(span);
    return span;
}

function applyHighlight() {
    searchState.highlights = [];
    const needle = searchState.text;
    for(const el of searchState.elements) {
        const text = el.dataset.searchable;
        const lowerText = text.toLowerCase();
        let index = lowerText.indexOf(needle);
        if (index === -1)
            el.textContent = text;
        else {
            el.innerHTML = "";
            let lastIndex = 0;
            while (index >= 0) {
                if (index !== lastIndex)
                    addText(el, text.substring(lastIndex, index));
                searchState.highlights.push(addHighlight(el, text.substr(index, needle.length)));
                lastIndex = index + needle.length;
                index = lowerText.indexOf(needle, lastIndex);
            }
            const rest = text.substr(lastIndex);
            if (rest)
                addText(el, text.substring(lastIndex));
        }
    }
}

function updateIndex() {
    searchState.highlights.forEach((element, index) => {
        const active = index === searchState.index;
        element.classList.toggle("search-highlight--is-active", active);
        active && element.scrollIntoView({
            behavior: "auto",
            block: "nearest"
        });
    });
}

export function search(text: string, searchNext: boolean, forward: boolean) {
    text = text.toLowerCase();
    if (searchState.text !== text) {
        searchState.text = text;
        searchState.elements = [...document.querySelectorAll("[data-searchable]")] as HTMLElement[];
    }
    if (!text) {
        resetHighlight();
    } else {
        applyHighlight();
    }
    if (searchNext) {
        searchState.index += forward ? 1 : -1;
        searchState.index = ((searchState.index + searchState.highlights.length) % searchState.highlights.length);
    }
    updateIndex();
}
