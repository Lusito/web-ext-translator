import { WetLanguage } from "../wetInterfaces";
import { CodeWriter } from "./CodeWriter";

import * as JSZip from "jszip";
import { saveAs } from "file-saver";
import { toJsonString } from "./toJsonString";

export function serializeMessages(language: WetLanguage, mainLanguage: WetLanguage) {
    const codeWriter = new CodeWriter();
    codeWriter.begin("{");
    for (const mainMessage of mainLanguage.messages) {
        const message = mainMessage.group ? mainMessage : language.messagesByKey[mainMessage.name];
        const attributes = [
            `"message": ${toJsonString(message ? message.message : "")}`
        ];
        const description = mainMessage.description;
        if (description)
            attributes.push(`"description": ${toJsonString(description)}`);
        const placeholders = mainMessage.placeholders;
        if (placeholders) {
            const placeholdersMapped = placeholders.map((p) => {
                const attr = [`"content": ${toJsonString(p.content)}`];
                if (p.example)
                    attr.push(`"example": ${toJsonString(p.example)}`);
                return `${JSON.stringify(p.name)}: { ${attr.join(", ")} }`;
            });
            attributes.push(`"placeholders": { ${placeholdersMapped.join(", ")} }`);
        }
        if (language !== mainLanguage && message && message.hash)
            attributes.push(`"hash": ${JSON.stringify(message.hash)}`);

        codeWriter.code(`${JSON.stringify(mainMessage.name)}: { ${attributes.join(", ")} },`);
    }
    codeWriter.emptyLine();
    codeWriter.code(`"__WET_LOCALE__": { "message": ${JSON.stringify(language.locale)} }`);
    codeWriter.end("}");
    codeWriter.emptyLine();
    return codeWriter.toString();
}

export function exportToZip(languages: WetLanguage[], mainLanguage: WetLanguage) {
    const zip = new JSZip();
    const localesFolder = zip.folder("_locales");
    languages.forEach((l) => {
        const folder = localesFolder.folder(l.locale.replace("-", "_"));
        folder.file("messages.json", serializeMessages(l, mainLanguage));
    });
    zip.generateAsync({ type: "blob" }).then((content) => saveAs(content, "wet_export.zip"));
}
