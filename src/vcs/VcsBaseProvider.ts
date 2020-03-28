/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import store from "../store";
import { createAlertDialog } from "../components/Dialogs/AlertDialog";
import { loadFiles } from "../utils/loader";
import { WetLoaderData } from "web-ext-translator-shared";

export interface VcsInfo {
    host: string;
    user: string;
    repository: string;
    branch: string;
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

    protected abstract fetch(info: VcsInfo): Promise<WetLoaderData>;

    public import(url: string) {
        const vcsInfo = this.parseUrl(url);
        if (vcsInfo) {
            store.dispatch({ type: "SET_LOADING", payload: `Importing ${vcsInfo.repository} from ${this.getName()}` });

            this.fetch(vcsInfo).then((result) => {
                const submitUrl = this.getSubmitUrl(vcsInfo);
                store.dispatch({ type: "LOAD", payload: { ...loadFiles(result), submitUrl, vcsInfo } });
                store.dispatch({ type: "SET_LOADING", payload: "" });
            }).catch((err) => {
                store.dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Something went wrong!", `Failed to import ${this.getName()} Project. Reason: ${err}`) });
                console.log("Opps, Something went wrong!", err);
                store.dispatch({ type: "SET_LOADING", payload: "" });
            });
        }
    }
}
