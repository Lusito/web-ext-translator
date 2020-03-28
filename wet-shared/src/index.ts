/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

export interface WetCodeWriterOptions {
    lineSeparator: string;
    indentationStep: string;
    insertFinalNewline: boolean;
}

export interface WetLoaderFile {
    path: string;
    data: string;
}

export interface WetLocaleFile extends WetLoaderFile {
    locale: string;
    editorConfigs: string[];
}

export interface WetLoaderData {
    locales: WetLocaleFile[];
    manifest: WetLoaderFile;
    editorConfigs: WetLoaderFile[];
}

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
    codeWriterOptions?: Partial<WetCodeWriterOptions>;
}

export interface WetPlaceholder {
    name: string;
    content: string;
    example?: string;
}

export type WetLoadFilesResult = string | WetLoaderData;

export interface WetSaveFilesEntry {
    locale: string;
    data: string;
}

export interface WetAppBridge {
    loadFiles(): WetLoadFilesResult;
    saveFiles(files: WetSaveFilesEntry[]): string | null;
    setDirty(dirty: boolean): void;
    openDirectory(): boolean;
    openBrowser(url: string): void;
}
