// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain, dialog, IpcMainEvent } from "electron";
import path from "path";
import fs from "fs";
import fileUrl from "file-url";
import { WetSaveFilesEntry, WetLoadFilesResult } from "web-ext-translator-shared";

function createWindow(workingDirectory: string) {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "preload.js")
        }
    });
    if (!app.commandLine.hasSwitch('debug'))
        mainWindow.setMenu(null);
    mainWindow.loadURL(fileUrl(path.join(__dirname, "docs", "index.html")) + "#" + workingDirectory);
}

app.whenReady().then(() => createWindow(process.cwd()));

app.on("window-all-closed", function() { process.platform !== "darwin" && app.quit(); });

app.on("activate", function() { BrowserWindow.getAllWindows().length === 0 && createWindow(process.cwd()); });

function on(channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) {
    ipcMain.on(channel, (event, ...args) => {
        event.returnValue = listener(event, ...args);
    });
}

on("close", (event) => {
    return dialog.showMessageBoxSync({
        type: "question",
        title: "Files have not been saved",
        message: "There are unsaved changes. Discard these changes?",
        buttons: [
            "OK",
            "Cancel"
        ],
        defaultId: 1,
        cancelId: 1
    }) === 0;
});

on("openDirectory", (event) => {
    dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), {
        properties: ['openDirectory'],
        title: "Select your Web Extension root directory"
    }).then((result) => {
        if (!result.canceled && result.filePaths.length)
            createWindow(result.filePaths[0]);
    });
});

const isDirectory = (file: string) => fs.existsSync(file) && fs.lstatSync(file).isDirectory();
const isFile = (file: string) => fs.existsSync(file) && !fs.lstatSync(file).isDirectory();
const readFile = (file: string) => fs.readFileSync(file, "utf-8");

on("loadFiles", (event, extDir): WetLoadFilesResult => {
    const localesDir = path.join(extDir, "_locales");
    const manifestFile = path.join(extDir, "manifest.json");
    if (isFile(manifestFile) && isDirectory(localesDir)) {
        try {
            const editorConfigsToLoad = new Set<string>();
            const locales = [];
            for(const localeDir of fs.readdirSync(localesDir)) {
                const localePath = path.join(localesDir, localeDir);
                if (!isDirectory(localePath))
                    continue;
                const messagesPath = path.join(localePath, "messages.json");
                if (isFile(messagesPath)) {
                    const editorConfigPaths = [[".editorconfig"], ["..", ".editorconfig"], ["..", "..", ".editorconfig"]]
                        .map((paths) => path.join(localePath, ...paths))
                        .filter(isFile);
                    editorConfigPaths.forEach((p) => editorConfigsToLoad.add(p));
                    locales.push({
                        path: messagesPath,
                        data: readFile(messagesPath),
                        locale: localeDir.replace("_", "-"),
                        editorConfigs: editorConfigPaths
                    });
                }
            }
            const editorConfigs = [...editorConfigsToLoad.values()].map((path) => ({
                path,
                data: readFile(path)
            }));
            return {
                locales,
                manifest: {
                    path: manifestFile,
                    data: readFile(manifestFile)
                },
                editorConfigs
            };
        } catch (e) {
            return e.message;
        }
    }
    return "manifest.json or _locales directory missing";
});

on("saveFiles", (event, extDir: string, files: WetSaveFilesEntry[]) => {
    const localesDir = path.join(extDir, "_locales");
    if (isDirectory(localesDir)) {
        try {
            for (const { locale, data } of files) {
                const dir = path.join(localesDir, locale.replace("-", "_"));
                if (!isDirectory(dir))
                    fs.mkdirSync(dir);
                const file = path.join(dir, "messages.json");
                fs.writeFileSync(file, data);
            }
            return null;
        } catch (e) {
            return e.message;
        }
    }
    return "Directory does not exist";
});
