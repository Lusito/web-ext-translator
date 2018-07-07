import { normalizeLanguages } from "./normalizeLanguages";
import store from "../store";
import { parseMessagesFile } from "./parseMessagesFile";

function getShortestPathForName(paths: string[], name: string) {
    const suffix = "/" + name;
    const result = paths.filter((e: string) => e === name || e.endsWith(suffix))
        .sort((a: string, b: string) => a.length - b.length)[0];
    if (!result)
        throw new Error(`Could not find path to: ${name}`);
    return result;
}

export function importFromGithub(githubMainLocaleUrl: string) {
    const parts = githubMainLocaleUrl.split("/");
    if (parts.length >= 5 && parts[2] === "github.com") {
        parts.splice(0, 3);
        const user = parts.shift();
        const repo = parts.shift();
        const branch = (parts.shift() === "tree" && parts.join("/")) || "master";
        let localesPath = "";
        let manifestPath = "";
        store.dispatch({ type: "SET_LOADING", payload: `Importing ${repo} from Github` });

        fetch(`https://api.github.com/repos/${user}/${repo}/git/trees/${branch}?recursive=1`).then((response) => {
            return response.json();
        }).then((jsonData) => {
            // Just in case, there are multiple _locales directories, choose the shortest path, as it's probably the right one.
            const paths = jsonData.tree.map((e: any) => e.path);
            localesPath = getShortestPathForName(paths, "_locales");
            manifestPath = getShortestPathForName(paths, "manifest.json");
            return Promise.all([
                fetch(`https://raw.githubusercontent.com/${user}/${repo}/${branch}/${manifestPath}`).then((response) => response.json()),
                fetch(`https://api.github.com/repos/${user}/${repo}/contents/${localesPath}?ref=${branch}`).then((response) => response.json())
            ]);
        }).then((results: any[]) => {
            const [manifest, localesDirJson] = results;
            const locales: string[] = localesDirJson.filter((v: { type: string }) => v.type === "dir").map((v: { name: string }) => v.name);

            const fetches = locales.map((locale) => fetch(`https://raw.githubusercontent.com/${user}/${repo}/${branch}/${localesPath}/${locale}/messages.json`).then((response) => response.text()));
            Promise.all(fetches).then((perLocaleJson: any[]) => {
                const languages = perLocaleJson.map((json, i) => parseMessagesFile(locales[i].replace(/_/g, "-"), json));
                const mainLanguage = languages.find((r) => r.locale === manifest.default_locale) || null;
                if (!mainLanguage)
                    throw new Error("Could not locate main language");
                normalizeLanguages(languages, mainLanguage);
                store.dispatch({ type: "LOAD", payload: { languages, mainLanguage } });
                store.dispatch({ type: "SET_LOADING", payload: "" });
            }).catch((err) => {
                console.log("Opps, Something went wrong!", err);
                store.dispatch({ type: "SET_LOADING", payload: "" });
            });
        }).catch((err) => {
            console.log("Opps, Something went wrong!", err);
            store.dispatch({ type: "SET_LOADING", payload: "" });
        });
    }
}
