import { WetLanguage, WetMessageType, WetMessage } from "web-ext-translator-shared";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { CodeWriter } from "./CodeWriter";
import { toJsonString } from "./toJsonString";

function serializeMessageMultiLine(
    mainMessage: WetMessage,
    writeHash: boolean,
    language: WetLanguage,
    codeWriter: CodeWriter
) {
    const message = language.messagesByKey[mainMessage.name];
    if (writeHash && (!message || !message.message)) return;

    codeWriter.begin(`${JSON.stringify(mainMessage.name)}: {`);

    const { description, placeholders } = mainMessage;
    const hash = writeHash && message && message.hash;
    let optionalComma = description || placeholders || hash ? "," : "";
    codeWriter.code(`"message": ${toJsonString(message ? message.message : "")}${optionalComma}`);
    if (description) {
        optionalComma = placeholders || hash ? "," : "";
        codeWriter.code(`"description": ${toJsonString(description)}${optionalComma}`);
    }
    if (placeholders) {
        codeWriter.begin('"placeholders": {');
        for (let i = 0; i < placeholders.length; i++) {
            const p = placeholders[i];
            const attr = [`"content": ${toJsonString(p.content)}`];
            if (p.example) attr.push(`"example": ${toJsonString(p.example)}`);
            optionalComma = i + 1 < placeholders.length ? "," : "";
            codeWriter.code(`${JSON.stringify(p.name)}: { ${attr.join(", ")} }${optionalComma}`);
        }
        optionalComma = hash ? "," : "";
        codeWriter.end(`}${optionalComma}`);
    }
    if (hash) codeWriter.code(`"hash": ${JSON.stringify(hash)}`);

    codeWriter.end("},");
}

function serializeMessageSingleLine(
    mainMessage: WetMessage,
    writeHash: boolean,
    language: WetLanguage,
    codeWriter: CodeWriter
) {
    const message = language.messagesByKey[mainMessage.name];
    if (writeHash && (!message || !message.message)) return;

    const attributes = [`"message": ${toJsonString(message ? message.message : "")}`];
    const { description, placeholders } = mainMessage;
    if (description) attributes.push(`"description": ${toJsonString(description)}`);
    if (placeholders) {
        const placeholdersMapped = placeholders.map((p) => {
            const attr = [`"content": ${toJsonString(p.content)}`];
            if (p.example) attr.push(`"example": ${toJsonString(p.example)}`);
            return `${JSON.stringify(p.name)}: { ${attr.join(", ")} }`;
        });
        attributes.push(`"placeholders": { ${placeholdersMapped.join(", ")} }`);
    }
    if (writeHash && message && message.hash) attributes.push(`"hash": ${JSON.stringify(message.hash)}`);
    codeWriter.code(`${JSON.stringify(mainMessage.name)}: { ${attributes.join(", ")} },`);
}

export function serializeMessages(language: WetLanguage, mainLanguage: WetLanguage) {
    // eslint-disable-next-line no-underscore-dangle
    const formatterMessage = mainLanguage.messagesByKey.__WET_FORMATTER__;
    const singleLine = formatterMessage && formatterMessage.message === "single_line";

    const codeWriter = new CodeWriter({
        ...mainLanguage.codeWriterOptions,
        ...language.codeWriterOptions,
    });

    let addEmptyLineBeforeGroup = false;
    codeWriter.begin("{");
    for (const mainMessage of mainLanguage.messages) {
        if (!addEmptyLineBeforeGroup) addEmptyLineBeforeGroup = true;
        else if (mainMessage.type !== WetMessageType.MESSAGE) codeWriter.emptyLine();

        if (mainMessage.type === WetMessageType.COMMENT) codeWriter.code(`// ${mainMessage.message}`);
        else if (mainMessage.type === WetMessageType.GROUP)
            codeWriter.code(
                `${JSON.stringify(mainMessage.name)}: { "message": ${toJsonString(mainMessage.message)} },`
            );
        else if (singleLine) serializeMessageSingleLine(mainMessage, language !== mainLanguage, language, codeWriter);
        else serializeMessageMultiLine(mainMessage, language !== mainLanguage, language, codeWriter);
    }
    codeWriter.emptyLine();
    if (language === mainLanguage && formatterMessage)
        codeWriter.code(`"__WET_FORMATTER__": { "message": ${JSON.stringify(formatterMessage.message)} },`);
    codeWriter.code(`"__WET_LOCALE__": { "message": ${JSON.stringify(language.locale)} }`);
    codeWriter.end("}");
    codeWriter.emptyLine();
    return codeWriter.toString();
}

export function exportToZip(languages: WetLanguage[], mainLanguage: WetLanguage, setDirty: (dirty: boolean) => void) {
    const zip = new JSZip();
    const localesFolder = zip.folder("_locales");
    languages.forEach((l) => {
        const folder = localesFolder.folder(l.locale.replace("-", "_"));
        folder.file("messages.json", serializeMessages(l, mainLanguage));
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "wet_export.zip");
        setDirty(false);
    });
}
