import { contextBridge, shell, ipcRenderer } from "electron";
import { WetSaveFilesEntry } from "web-ext-translator-shared";

const extDir = window.location.hash.substr(1);
let isDirty = false
let forceQuit = false;

window.addEventListener('beforeunload', evt => {
    if (!forceQuit && isDirty) {
        evt.returnValue = false;
        setTimeout(() => {
            if (ipcRenderer.sendSync('close')) {
                forceQuit = true
                window.close()
            }
        });
    }
});

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
                isDirty = false;
            return error;
        },
        setDirty(dirty: boolean) {
            isDirty = dirty;
        },
        openDirectory() {
            ipcRenderer.send('openDirectory');
        },
        openBrowser(url: string) {
            shell.openExternal(url);
        }
    }
);
