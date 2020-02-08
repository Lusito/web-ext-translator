/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as JSZip from "jszip";
import { WetLanguage } from "../wetInterfaces";
import store from "../store";
import { parseMessagesFile } from "./parseMessagesFile";
import { normalizeLanguages } from "./normalizeLanguages";
import { parseJsonFile } from "./parseJsonFile";
import { createAlertDialog } from "../components/Dialogs/AlertDialog";
import { getEditorConfigPaths, parseEditorConfig, getEditorConfigPropsForPath, EditorConfig } from "../utils/editorConfig";

export function importFromZip(zipFile: File) {
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
        console.error("Not a zip: " + zipFile.name);
        store.dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Something went wrong!", `Not a zip: ${zipFile.name}`) });
        return;
    }

    JSZip.loadAsync(zipFile).then(async (zip) => {
        const paths = Object.keys(zip.files);
        const localesFolder = zip.folder("_locales");
        const manifestFile = zip.file("manifest.json");
        if (!manifestFile) {
            throw new Error("Extension manifest not found.");
        }

        const manifest = parseJsonFile("manifest.json", await manifestFile.async("text")) as any;

        const configCache = new Map<string, EditorConfig>();
        const languagePromises: Array<Promise<WetLanguage>> = [];

        localesFolder.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                return;
            }

            const locale = relativePath.slice(0, -1);
            const localePath = zipEntry.name.slice(0, -1);

            const messagesPath = `${localePath}/messages.json`;
            const messagesFile = zip.file(messagesPath);
            if (!messagesFile) {
                return;
            }

            languagePromises.push((async () => {
                const configPaths = getEditorConfigPaths(paths, localePath);
                const matchedConfigs = await Promise.all(configPaths.map(async (path) => {
                    const file = zip.file(path);
                    if (!configCache.has(path)) {
                        configCache.set(path, parseEditorConfig(await file.async("text")));
                    }
                    return configCache.get(path)!;
                }));

                const messagesContent = await messagesFile.async("text");
                const language = parseMessagesFile(locale, messagesContent);
                language.editorConfig = getEditorConfigPropsForPath(matchedConfigs, messagesPath);

                return language;
            })());
        });

        const languages = await Promise.all(languagePromises);
        const mainLanguage = languages.find((r) => r.locale === manifest.default_locale) || null;
        if (mainLanguage) {
            normalizeLanguages(languages, mainLanguage);
            store.dispatch({ type: "LOAD", payload: { languages, mainLanguage } });
        } else {
            throw new Error("Language files not found or default_locale manifest property not specified.");
        }
    }).catch((e) => {
        console.error("Error reading " + zipFile.name + ": " + e.message);
        store.dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Something went wrong!", `Error reading ${zipFile.name}: ${e.message}`) });
    });
}
