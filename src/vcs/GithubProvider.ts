/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { VcsInfo, VcsBaseProvider, VcsFetchResult } from "./VcsBaseProvider";

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
        let localesPath = "";
        let defaultLocale = "";
        return fetch(`https://api.github.com/repos/${info.user}/${info.repository}/git/trees/${info.branch}?recursive=1`).then((response) => {
            return response.json();
        }).then((jsonData) => {
            // Just in case, there are multiple _locales directories, choose the shortest path, as it's probably the right one.
            const paths = jsonData.tree.map((e: any) => e.path);
            localesPath = this.getShortestPathForName(paths, "_locales");
            const manifestPath = this.getShortestPathForName(paths, "manifest.json");
            return Promise.all([
                fetch(`https://raw.githubusercontent.com/${info.user}/${info.repository}/${info.branch}/${manifestPath}`).then((response) => response.json()),
                fetch(`https://api.github.com/repos/${info.user}/${info.repository}/contents/${localesPath}?ref=${info.branch}`).then((response) => response.json())
            ]);
        }).then((results: any[]) => {
            defaultLocale = results[0].default_locale;
            const locales: string[] = results[1].filter((v: { type: string }) => v.type === "dir").map((v: { name: string }) => v.name);

            const fetches = locales.map((locale) => {
                return fetch(`https://raw.githubusercontent.com/${info.user}/${info.repository}/${info.branch}/${localesPath}/${locale}/messages.json`)
                    .then((response) => response.text())
                    .then((contents) => ({ locale, contents }));
            });
            return Promise.all(fetches);
        }).then((files) => {
            return { files, defaultLocale };
        });
    }
}
