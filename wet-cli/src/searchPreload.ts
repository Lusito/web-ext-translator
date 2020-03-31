import { contextBridge, ipcRenderer } from "electron";
import { Key } from "ts-keycode-enum";

contextBridge.exposeInMainWorld("electronBridge", {
    init() {
        const search = document.getElementById("search") as HTMLInputElement;
        const label = document.getElementById("label");
        const prev = document.getElementById("prev");
        const next = document.getElementById("next");
        const close = document.getElementById("close");

        search.focus();
        if (document.location.hash.length > 1) search.value = document.location.hash.substr(1);
        else {
            prev.setAttribute("disabled", "disabled");
            next.setAttribute("disabled", "disabled");
        }

        // fixme:
        // matchCase?: boolean;
        // wordStart?: boolean;
        const on = (target: EventTarget, ev: string, cb: (e: Event) => void) => target.addEventListener(ev, cb);

        on(search, "input", () => {
            if (search.value) {
                ipcRenderer.sendSync("find-in-page", search.value);
                search.focus();
                prev.removeAttribute("disabled");
                next.removeAttribute("disabled");
            } else {
                ipcRenderer.sendSync("stop-find-in-page", "clearSelection");
                label.innerText = "";
                prev.setAttribute("disabled", "disabled");
                next.setAttribute("disabled", "disabled");
            }
        });
        on(search, "keyup", (e: KeyboardEvent) => {
            if (e.keyCode === Key.Escape) ipcRenderer.sendSync("hide-search", search.value);
            else if (search.value && e.keyCode === Key.Enter) {
                ipcRenderer.sendSync("find-in-page", search.value, { forward: !e.shiftKey, findNext: true });
                search.focus();
            }
        });
        on(prev, "click", () => {
            search.focus();
            ipcRenderer.sendSync("find-in-page", search.value, { forward: false, findNext: true });
        });
        on(next, "click", () => {
            search.focus();
            ipcRenderer.sendSync("find-in-page", search.value, { findNext: true });
        });
        on(close, "click", () => {
            ipcRenderer.sendSync("hide-search", search.value);
        });

        ipcRenderer.on("update", (_, index, count) => {
            if (!search.value.length) return;

            if (count === null) label.innerHTML = "";
            else label.innerText = `${index}/${count}`;
        });
        on(window, "focus", () => search.focus());
    },
});
