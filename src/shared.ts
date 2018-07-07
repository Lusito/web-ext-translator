/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { WetLanguage, WetAppBridge } from "./wetInterfaces";

export interface LoadedExtension {
    firstLocale: string | null;
    secondLocale: string | null;
    languages: { [s: string]: WetLanguage };
    mainLanguage: WetLanguage;
}

export interface State {
    dialogs: JSX.Element[];
    previewVisible: boolean;
    markdown: string;
    loading: string;
    extension: LoadedExtension | null;
    appBridge: WetAppBridge | null;
}

let nextId = 1;
export function generateId() {
    return nextId++;
}
