/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import store from "../store";
import { normalizeLanguages } from "../utils/normalizeLanguages";
import { parseMessagesFile } from "../utils/parseMessagesFile";
import { createAlertDialog } from "../components/Dialogs/AlertDialog";

export interface VcsInfo {
    user: string;
    repository: string;
    branch: string;
}

export interface VcsLanguageFile {
    locale: string;
    contents: string;
}

export interface VcsFetchResult {
    files: VcsLanguageFile[];
    defaultLocale: string;
}

export abstract class VcsBaseProvider {
    protected getShortestPathForName(paths: string[], name: string) {
        const suffix = "/" + name;
        const result = paths.filter((e: string) => e === name || e.endsWith(suffix))
            .sort((a: string, b: string) => a.length - b.length)[0];
        if (!result)
            throw new Error(`Could not find path to: ${name}`);
        return result;
    }

    protected abstract getName(): string;

    protected abstract getSubmitUrl(info: VcsInfo): string | undefined;

    protected abstract parseUrl(url: string): VcsInfo | null;

    protected abstract fetch(info: VcsInfo): Promise<VcsFetchResult>;

    public import(url: string) {
        const info = this.parseUrl(url);
        if (info) {
            store.dispatch({ type: "SET_LOADING", payload: `Importing ${info.repository} from ${this.getName()}` });

            this.fetch(info).then((result) => {
                const languages = result.files.map((file) => parseMessagesFile(file.locale.replace(/_/g, "-"), file.contents));
                const mainLanguage = languages.find((r) => r.locale === result.defaultLocale) || null;
                if (!mainLanguage)
                    throw new Error("Could not locate main language");
                normalizeLanguages(languages, mainLanguage);
                const submitUrl = this.getSubmitUrl(info);
                store.dispatch({ type: "LOAD", payload: { languages, mainLanguage, submitUrl } });
                store.dispatch({ type: "SET_LOADING", payload: "" });
            }).catch((err) => {
                store.dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Something went wrong!", `Failed to import ${this.getName()} Project. Reason: ${err}`) });
                console.log("Opps, Something went wrong!", err);
                store.dispatch({ type: "SET_LOADING", payload: "" });
            });
        }
    }
}
