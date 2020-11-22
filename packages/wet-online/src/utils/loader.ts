import { WetLanguage, WetLocaleFile, WetLoaderData } from "web-ext-translator-shared";

import { getEditorConfigPropsForPath, EditorConfig, parseEditorConfigs } from "./editorConfig";
import { parseMessagesFile } from "./parseMessagesFile";
import { parseJsonFile } from "./parseJsonFile";
import { normalizeLanguages } from "./normalizeLanguages";

function applyCodeWriterOptions(
    file: WetLocaleFile,
    editorConfigs: { [s: string]: EditorConfig },
    language: WetLanguage
) {
    if (file.editorConfigs.length) {
        const matchedConfigs = file.editorConfigs.map((path) => editorConfigs[path]);
        const editorConfig = getEditorConfigPropsForPath(matchedConfigs, file.path);
        if (editorConfig) {
            language.codeWriterOptions = {};
            if (editorConfig.end_of_line === "lf") language.codeWriterOptions.lineSeparator = "\n";
            else if (editorConfig.end_of_line === "crlf") language.codeWriterOptions.lineSeparator = "\r\n";

            if (editorConfig.indent_style === "tab") language.codeWriterOptions.indentationStep = "\t";
            else if (typeof editorConfig.indent_size === "number")
                language.codeWriterOptions.indentationStep = " ".repeat(editorConfig.indent_size);

            if (typeof editorConfig.insert_final_newline === "boolean")
                language.codeWriterOptions.insertFinalNewline = editorConfig.insert_final_newline;
            return language;
        }
    }
    // Auto-detect from file content
    language.codeWriterOptions = {
        lineSeparator: file.data.includes("\r\n") ? "\r\n" : "\n",
        insertFinalNewline: file.data.endsWith("\n"),
    };
    const match = /\n([ \t]+)"/.exec(file.data);
    // eslint-disable-next-line prefer-destructuring
    if (match) language.codeWriterOptions.indentationStep = match[1];
    return language;
}

export function loadFiles({ locales, manifest, editorConfigs }: WetLoaderData) {
    const { default_locale } = parseJsonFile(manifest.path, manifest.data) as any;
    const parsedEditorConfigs = parseEditorConfigs(editorConfigs);
    const languages = locales.map((file) =>
        applyCodeWriterOptions(file, parsedEditorConfigs, parseMessagesFile(file.path, file.locale, file.data))
    );
    const mainLanguage = languages.find((r) => r.locale === default_locale) ?? null;
    if (!mainLanguage)
        throw new Error(
            `Language files not found or default_locale manifest property not specified. ${default_locale}->${languages.length}`
        );

    normalizeLanguages(languages, mainLanguage);
    return { languages, mainLanguage };
}
