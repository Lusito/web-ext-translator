/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { CodeWriterOptions } from "./utils/CodeWriter";
import { LoaderData } from "./utils/loader";

export enum WetMessageType {
    GROUP,
    COMMENT,
    MESSAGE
}

export interface WetMessage {
    type: WetMessageType;
    name: string;
    message: string;
    description?: string;
    placeholders?: WetPlaceholder[];
    hash?: string;
}

export interface WetLanguage {
    locale: string;
    label: string;
    messages: WetMessage[];
    messagesByKey: { [s: string]: WetMessage };
    codeWriterOptions?: Partial<CodeWriterOptions>;
}

export interface WetPlaceholder {
    name: string;
    content: string;
    example?: string;
}

export const WET_PROTOCOL_VERSION = 1;

export interface LoadFilesResultError {
    error: string;
}

export interface LoadFilesResultSuccess {
    error: null;
    data: LoaderData;
}

export type LoadFilesResult = LoadFilesResultError | LoadFilesResultSuccess;

export interface SaveFilesEntry {
    locale: string;
    data: string;
}

export interface WetAppBridge {
    loadFiles(): LoadFilesResult;
    saveFiles(files: SaveFilesEntry[]): string | null;
    setDirty(dirty: boolean): void;
    openDirectory(): boolean;
    openBrowser(url: string): void;
    consoleProxy(method: string, message: string, stack: string | null): void;
}

declare global {
    interface Window {
        wet: {
            version: string;
            protocolVersion: number;
            setBridge(bride: WetAppBridge): void;
            searchNext(text: string, force: boolean): void;
            searchPrev(text: string): void;
        };
    }
}
