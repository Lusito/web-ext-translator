/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { WetMessage, WetPlaceholder, WetLanguage, WetMessageType } from "../wetInterfaces";
import { JsonTokenizer } from "./JsonTokenizer";
import { EditorConfigSectionProps } from "./editorConfig";

function parsePlaceholder(tokenizer: JsonTokenizer) {
    const name = tokenizer.expectValueToken("string");
    tokenizer.expectCharToken(":");
    tokenizer.expectCharToken("{");
    const result: WetPlaceholder = {
        name,
        content: "",
        example: ""
    };
    do {
        const key = tokenizer.expectValueToken("string");
        tokenizer.expectCharToken(":");
        if (key === "content")
            result.content = tokenizer.expectValueToken("string");
        else if (key === "example")
            result.example = tokenizer.expectValueToken("string");
        else
            console.warn(`Found unknown key '${key}' at ${tokenizer.getTokenPosition()}, will be ignored`);
    } while (tokenizer.testCharToken(","));
    tokenizer.expectCharToken("}");
    return result;
}

function skipValue(tokenizer: JsonTokenizer) {
    const token = tokenizer.skipComments();
    if (token.type === "char") {
        if (token.content === "{") {
            if (!tokenizer.testCharToken("}")) {
                do {
                    tokenizer.expectValueToken("string");
                    tokenizer.expectCharToken(":");
                    skipValue(tokenizer);
                } while (tokenizer.testCharToken(","));
                tokenizer.expectCharToken("}");
            }
        } else if (token.content === "[") {
            if (!tokenizer.testCharToken("]")) {
                do {
                    skipValue(tokenizer);
                } while (tokenizer.testCharToken(","));
                tokenizer.expectCharToken("]");
            }
        } else {
            throw new Error(`Unexpected char token '${token.content}' at ${tokenizer.getTokenPosition()}`);
        }
    }
}

function parseMessage(tokenizer: JsonTokenizer, name: string) {
    tokenizer.expectCharToken(":");
    tokenizer.expectCharToken("{");
    const type = name.startsWith("__WET_GROUP__") ? WetMessageType.GROUP : WetMessageType.MESSAGE;
    const result: WetMessage = { type, name, message: "" };

    do {
        const key = tokenizer.expectValueToken("string");
        tokenizer.expectCharToken(":");
        if (key === "message")
            result.message = tokenizer.expectValueToken("string");
        else if (key === "description")
            result.description = tokenizer.expectValueToken("string");
        else if (key === "hash")
            result.hash = tokenizer.expectValueToken("string");
        else if (key === "placeholders") {
            tokenizer.expectCharToken("{");
            if (!tokenizer.testCharToken("}")) {
                if (!result.placeholders)
                    result.placeholders = [];
                do {
                    result.placeholders.push(parsePlaceholder(tokenizer));
                } while (tokenizer.testCharToken(","));
                tokenizer.expectCharToken("}");
            }
        } else {
            console.warn(`Found unknown key '${key}' at ${tokenizer.getTokenPosition()}, will be ignored`);
            skipValue(tokenizer);
        }
    } while (!tokenizer.isDone() && tokenizer.testCharToken(","));
    tokenizer.expectCharToken("}");
    return result;
}

export function parseMessagesFile(locale: string, fileContent: string, editorConfig?: EditorConfigSectionProps) {
    const language: WetLanguage = {
        locale,
        label: locale,
        messages: [],
        messagesByKey: {}
    };

    if (editorConfig) {
        language.editorConfig = editorConfig;
    }

    const tokenizer = new JsonTokenizer(`${locale}/messages.json`, fileContent);
    tokenizer.expectCharToken("{");
    while (!tokenizer.isDone()) {
        const token = tokenizer.next();
        if (token.type === "comment") {
            language.messages.push({
                type: WetMessageType.COMMENT,
                name: `group_${language.messages.length}`,
                message: token.content as string
            });
        } else if (token.content === "}") {
            return language;
        } else if (typeof (token.content) === "string") {
            const msg = parseMessage(tokenizer, token.content);
            language.messages.push(msg);
            if (msg.type === WetMessageType.MESSAGE)
                language.messagesByKey[msg.name] = msg;
            if (!tokenizer.testCharToken(","))
                break;
        }
    }
    tokenizer.expectCharToken("}");
    return language;
}
