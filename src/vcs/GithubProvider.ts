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

    protected fetch(info: VcsInfo): Promise<VcsFetchResult> {
        const repoPrefixRaw = `https://raw.githubusercontent.com/${info.user}/${info.repository}/${info.branch}`;
        const repoPrefixApi = `https://api.github.com/repos/${info.user}/${info.repository}`;

        let localesPath = "";
        let defaultLocale = "";
        return fetch(`${repoPrefixApi}/git/trees/${info.branch}?recursive=1`).then(responseToJSON).then((jsonData: any) => {
            // Just in case, there are multiple _locales directories, choose the shortest path, as it's probably the right one.
            const paths = jsonData.tree.map((e: any) => e.path);
            localesPath = this.getShortestPathForName(paths, "_locales");
            const manifestPath = this.getShortestPathForName(paths, "manifest.json");

            const fetches = [
                fetch(`${repoPrefixRaw}/${manifestPath}`).then(responseToJSON),
                fetch(`${repoPrefixApi}/contents/${localesPath}?ref=${info.branch}`).then(responseToJSON)
            ];

            const editorConfigFetches: Array<Promise<string>> = [];
            const editorConfigPaths = getEditorConfigPaths(paths, localesPath);
            for (const path of editorConfigPaths) {
                editorConfigFetches.push(fetch(`${repoPrefixRaw}/${path}`).then((res) => res.text()));
            }

            return Promise.all([
                ...fetches,
                Promise.all(editorConfigFetches)
            ]);
        }).then((results: any[]) => {
            defaultLocale = results[0].default_locale;
            const locales: string[] = results[1].filter((v: { type: string }) => v.type === "dir").map((v: { name: string }) => v.name);

            let parsedEditorConfigs: EditorConfig[] = [];
            if (results[2] && results[2].length) {
                parsedEditorConfigs = results[2]
                    .map((configText: string) => parseEditorConfig(configText));
            }

            const fetches = locales.map((locale) => {
                const localePath = `${localesPath}/${locale}/messages.json`;

                return fetch(`${repoPrefixRaw}/${localePath}`)
                    .then((response) => response.text())
                    .then((contents) => {
                        const ret: VcsLanguageFile  = { locale, contents };

                        const section = getEditorConfigPropsForPath(parsedEditorConfigs, localePath);
                        if (section) {
                            ret.editorConfig = section;
                        }

                        return ret;
                    });
            });
            return Promise.all(fetches);
        }).then((files) => {
            return { files, defaultLocale };
        });
    }
}
