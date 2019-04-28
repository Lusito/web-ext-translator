/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { WetLanguage, WetAppBridge } from "./wetInterfaces";
import { VcsInfo } from "./vcs/VcsBaseProvider";

export interface LoadedExtension {
    firstLocale: string | null;
    secondLocale: string | null;
    languages: { [s: string]: WetLanguage };
    mainLanguage: WetLanguage;
    submitUrl?: string;
    vcsInfo?: VcsInfo;
}

export interface State {
    dialogs: JSX.Element[];
    previewVisible: boolean;
    markdown: string;
    markdownRTL: boolean;
    loading: string;
    extension: LoadedExtension | null;
    webExtensionMode: boolean;
    appBridge: WetAppBridge | null;
}

let nextId = 1;
export function generateId() {
    return nextId++;
}
