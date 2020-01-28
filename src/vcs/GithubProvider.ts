/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { VcsInfo, VcsBaseProvider, VcsFetchResult, VcsLanguageFile } from "./VcsBaseProvider";
import { parseJsonFile } from "../utils/parseJsonFile";
import { getEditorConfigPaths, parseEditorConfig, getEditorConfigPropsForPath, EditorConfig } from "../utils/editorConfig";

function responseToJSON(response: Response) {
    return response.text().then((text) => parseJsonFile(response.url, text));
}

function responseToText(response: Response) {
    return response.text();
}

export class GithubProvider extends VcsBaseProvider {

    protected getName() {
        return "Github";
    }

    protected getSubmitUrl(info: VcsInfo): string | undefined {
        return `https://github.com/${info.user}/${info.repository}/issues/new?title={{TITLE}}&body={{BODY}}`;
    }

    protected parseUrl(url: string): VcsInfo | null {
        const parts = url.split("/");
        if (parts.length >= 5 && parts[2] === "github.com") {
            parts.splice(0, 3);
            const user = parts.shift() as string;
            const repository = parts.shift() as string;
            const branch = (parts.shift() === "tree" && parts.join("/")) || "master";
            return { host: "github", user, repository, branch };
        }
        return null;
    }

    protected async fetch(info: VcsInfo): Promise<VcsFetchResult> {
        const repoPrefixRaw = `https://raw.githubusercontent.com/${info.user}/${info.repository}/${info.branch}`;
        const repoPrefixApi = `https://api.github.com/repos/${info.user}/${info.repository}`;

        const jsonData: any = await fetch(`${repoPrefixApi}/git/trees/${info.branch}?recursive=1`).then(responseToJSON);

        // Just in case, there are multiple _locales directories, choose the shortest path, as it's probably the right one.
        const paths = jsonData.tree.map((e: any) => e.path);
        const localesPath = this.getShortestPathForName(paths, "_locales");
        const manifestPath = this.getShortestPathForName(paths, "manifest.json");

        const [ manifestResult, localesResult ]: any[] = await Promise.all([
            fetch(`${repoPrefixRaw}/${manifestPath}`).then(responseToJSON),
            fetch(`${repoPrefixApi}/contents/${localesPath}?ref=${info.branch}`).then(responseToJSON)
        ]);

        const defaultLocale = manifestResult.default_locale;
        const locales: string[] = localesResult.filter((v: { type: string }) => v.type === "dir").map((v: { name: string }) => v.name);

        const editorConfigCache = new Map<string, Promise<string>>();

        const fetches: Array<Promise<VcsLanguageFile>> = [];
        for (const locale of locales) {
            const localePath = `${localesPath}/${locale}`;
            const messagesPath = `${localePath}/messages.json`;

            const editorConfigFetches: Array<Promise<string>> = [];
            const editorConfigPaths = getEditorConfigPaths(paths, localePath);
            for (const path of editorConfigPaths) {
                if (editorConfigCache.has(path)) {
                    const promise = editorConfigCache.get(path);
                    if (promise) {
                        editorConfigFetches.push(promise);
                    }
                } else {
                    const promise = fetch(`${repoPrefixRaw}/${path}`).then(responseToText);
                    editorConfigCache.set(path, promise);
                    editorConfigFetches.push(promise);
                }
            }

            fetches.push((async () => {
                const [ messagesContents, editorConfigContents ] = await Promise.all([
                    fetch(`${repoPrefixRaw}/${messagesPath}`).then(responseToText),
                    Promise.all(editorConfigFetches)
                ]);

                let parsedEditorConfigs: EditorConfig[] = [];
                if (editorConfigContents && editorConfigContents.length) {
                    parsedEditorConfigs = editorConfigContents
                        .map((configText) => parseEditorConfig(configText));
                }

                const ret: VcsLanguageFile = {
                    locale,
                    contents: messagesContents
                };

                const section = getEditorConfigPropsForPath(parsedEditorConfigs, messagesPath);
                if (section) {
                    ret.editorConfig = section;
                }

                return ret;
            })());
        }

        const files = await Promise.all(fetches);

        return { files, defaultLocale };
    }
}
