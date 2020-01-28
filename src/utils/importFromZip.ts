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
import { getEditorConfigPaths, parseEditorConfig, getEditorConfigPropsForPath } from "../utils/editorConfig";

export function importFromZip(zipFile: File) {
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
        console.error("Not a zip: " + zipFile.name);
        store.dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Something went wrong!", `Not a zip: ${zipFile.name}`) });
        return;
    }

    JSZip.loadAsync(zipFile).then(async (zip) => {
        const localesFolder = zip.folder("_locales");
        const manifestFile = zip.file("manifest.json");
        const manifest = parseJsonFile("manifest.json", await manifestFile.async("text")) as any;

        const languagePromises: Array<Promise<WetLanguage>> = [];

        localesFolder.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                return;
            }

            const localeFolder = zip.folder(zipEntry.name);
            const messagesFile = localeFolder.file("messages.json");

            if (!messagesFile) {
                return;
            }

            languagePromises.push((async () => {
                const editorConfigPaths = getEditorConfigPaths(Object.keys(zip.files), localeFolder.name);
                const editorConfigFiles = zip.filter((path, file) => editorConfigPaths.indexOf(file.name) > -1);

                const parsedEditorConfigs = await Promise.all(
                        editorConfigFiles.map((file) => file.async("text").then(parseEditorConfig)));

                const messagesContent = await messagesFile.async("text");
                const language = parseMessagesFile(relativePath.substr(0, relativePath.length - 1), messagesContent);
                const section = getEditorConfigPropsForPath(parsedEditorConfigs, `${relativePath}/messages.json`);
                if (section) {
                    language.editorConfig = section;
                }

                return language;
            })());
        });

        const languages = await Promise.all(languagePromises);
        const mainLanguage = languages.find((r) => r.locale === manifest.default_locale) || null;
        if (mainLanguage) {
            normalizeLanguages(languages, mainLanguage);
            store.dispatch({ type: "LOAD", payload: { languages, mainLanguage } });
        }
    }, (e) => {
        console.error("Error reading " + zipFile.name + ": " + e.message);
        store.dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Something went wrong!", `Error reading ${zipFile.name}: ${e.message}`) });
    });
}
