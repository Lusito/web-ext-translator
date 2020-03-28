import { contextBridge, shell, dialog, ipcRenderer } from "electron";
import { WetSaveFilesEntry } from "web-ext-translator-shared";

const extDir = window.location.hash.substr(1);

function preventClose() {
    dialog.showMessageBox({
        type: "question",
        title: "Files have not been saved",
        message: "There are unsaved changes. Discard these changes?",
        buttons: [
            "OK",
            "Cancel"
        ],
        defaultId: 1,
        cancelId: 1
    }).then((result) => {
        if (result.response === 0) {
            ipcRenderer.send('close');
        }
    });
    return false;
}
function noop() {}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "electronBridge", {
        loadFiles() {
            return ipcRenderer.sendSync('loadFiles', extDir);
        },
        saveFiles(files: WetSaveFilesEntry[]) {
            const error = ipcRenderer.sendSync('saveFiles', extDir, files);
            if (!error)
                this.setDirty(false);
            return error;
        },
        setDirty(dirty: boolean) {
            window.onbeforeunload = dirty ? preventClose : noop;
        },
        openDirectory() {
            ipcRenderer.send('openDirectory');
        },
        openBrowser(url: string) {
            shell.openExternal(url);
        }
    }
);
