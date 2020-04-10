import JSZip from "jszip";
import { WetLocaleFile, WetLoaderFile } from "web-ext-translator-shared";

import { getEditorConfigPaths } from "./editorConfig";
import { loadFiles } from "./loader";
import { LoadExtensionData } from "../redux/extension";

async function importFromZipAsync(
    zipFile: File,
    setLoading: (message: string) => void,
    onSuccess: (data: LoadExtensionData) => void,
    onError: (message: string) => void
) {
    try {
        setLoading(`Importing from zip file ${zipFile.name}`);
        const zip = await JSZip.loadAsync(zipFile);
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

        onSuccess(
            loadFiles({
                locales: await Promise.all(languages),
                manifest: {
                    path: "manifest.json",
                    data: await manifestFile.async("text"),
                },
                editorConfigs,
            })
        );
        setLoading("");
        window.history.replaceState({}, "", "/");
    } catch (e) {
        console.error(`Error reading ${zipFile.name}: ${e.message}`);
        onError(`Error reading ${zipFile.name}: ${e.message}`);
        setLoading("");
    }
}

export function importFromZip(
    zipFile: File,
    setLoading: (message: string) => void,
    onSuccess: (data: LoadExtensionData) => void,
    onError: (message: string) => void
) {
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
        console.error(`Not a zip: ${zipFile.name}`);
        onError(`Not a zip: ${zipFile.name}`);
    } else {
        importFromZipAsync(zipFile, setLoading, onSuccess, onError);
    }
}
