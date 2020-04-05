import { WetLoaderData, WetLocaleFile, WetLoaderFile } from "web-ext-translator-shared";

import { VcsInfo, VcsBaseProvider } from "./VcsBaseProvider";
import { parseJsonFile } from "../utils/parseJsonFile";
import { getEditorConfigPaths } from "../utils/editorConfig";

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

    protected async fetch(info: VcsInfo): Promise<WetLoaderData> {
        const repoPrefixRaw = `https://raw.githubusercontent.com/${info.user}/${info.repository}/${info.branch}`;
        const repoPrefixApi = `https://api.github.com/repos/${info.user}/${info.repository}`;

        const jsonData: any = await fetch(`${repoPrefixApi}/git/trees/${info.branch}?recursive=1`).then(responseToJSON);

        // Just in case, there are multiple _locales directories, choose the shortest path, as it's probably the right one.
        const paths: string[] = jsonData.tree.map((e: any) => e.path);
        const localesPath = this.getShortestPathForName(paths, "_locales");
        const manifestPath = this.getShortestPathForName(paths, "manifest.json");

        const manifestResult = await fetch(`${repoPrefixRaw}/${manifestPath}`).then(responseToText);
        const localesResult = (await fetch(`${repoPrefixApi}/contents/${localesPath}?ref=${info.branch}`).then(
            responseToJSON
        )) as Array<{ type: string; name: string }>;

        const locales = localesResult.filter((v) => v.type === "dir").map((v) => v.name);

        const editorConfigsToLoad = new Set<string>();
        const fetches = locales.map(
            async (locale): Promise<WetLocaleFile> => {
                const localePath = `${localesPath}/${locale}`;
                const messagesPath = `${localePath}/messages.json`;
                const editorConfigPaths = getEditorConfigPaths(paths, localePath);
                editorConfigPaths.forEach((path) => editorConfigsToLoad.add(path));

                return {
                    path: messagesPath,
                    data: await fetch(`${repoPrefixRaw}/${messagesPath}`).then(responseToText),
                    locale,
                    editorConfigs: editorConfigPaths,
                };
            }
        );

        const editorConfigs: WetLoaderFile[] = await Promise.all(
            [...editorConfigsToLoad.values()].map(async (path) => ({
                path,
                data: await fetch(`${repoPrefixRaw}/${path}`).then(responseToText),
            }))
        );

        return {
            locales: await Promise.all(fetches),
            manifest: {
                path: manifestPath,
                data: manifestResult,
            },
            editorConfigs,
        };
    }
}
