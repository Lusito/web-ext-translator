/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import JSZip from "jszip";
import { WetLocaleFile, WetLoaderFile } from "web-ext-translator-shared";

import store from "../store";
import { createAlertDialog } from "../components/Dialogs/AlertDialog";
import { getEditorConfigPaths } from "./editorConfig";
import { loadFiles } from "./loader";

export function importFromZip(zipFile: File) {
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
        console.error(`Not a zip: ${zipFile.name}`);
        store.dispatch({
            type: "SHOW_DIALOG",
            payload: createAlertDialog("Something went wrong!", `Not a zip: ${zipFile.name}`),
        });
        return;
    }

    JSZip.loadAsync(zipFile)
        .then(async (zip) => {
            const paths = Object.keys(zip.files);
            const localesFolder = zip.folder("_locales");
            const manifestFile = zip.file("manifest.json");
            if (!manifestFile) throw new Error("Extension manifest not found.");

            const languages: Array<Promise<WetLocaleFile>> = [];
            const editorConfigsToLoad = new Set<string>();

            localesFolder.forEach((relativePath, zipEntry) => {
                if (zipEntry.dir) {
                    const locale = relativePath.slice(0, -1);
                    const localePath = zipEntry.name.slice(0, -1);
                    const messagesPath = `${localePath}/messages.json`;
                    const messagesFile = zip.file(messagesPath);
                    if (messagesFile) {
                        const editorConfigPaths = getEditorConfigPaths(paths, localePath);
                        editorConfigPaths.forEach((path) => editorConfigsToLoad.add(path));

                        languages.push(
                            (async (): Promise<WetLocaleFile> => {
                                return {
                                    path: messagesPath,
                                    data: await messagesFile.async("text"),
                                    locale,
                                    editorConfigs: editorConfigPaths,
                                };
                            })()
                        );
                    }
                }
            });

            const editorConfigs: WetLoaderFile[] = await Promise.all(
                [...editorConfigsToLoad.values()].map(async (path) => ({
                    path,
                    data: await zip.file(path).async("text"),
                }))
            );

            store.dispatch({
                type: "LOAD",
                payload: loadFiles({
                    locales: await Promise.all(languages),
                    manifest: {
                        path: "manifest.json",
                        data: await manifestFile.async("text"),
                    },
                    editorConfigs,
                }),
            });
        })
        .catch((e) => {
            console.error(`Error reading ${zipFile.name}: ${e.message}`);
            store.dispatch({
                type: "SHOW_DIALOG",
                payload: createAlertDialog("Something went wrong!", `Error reading ${zipFile.name}: ${e.message}`),
            });
        });
}
