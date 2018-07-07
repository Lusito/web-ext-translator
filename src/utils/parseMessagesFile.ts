/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */
import { WetMessage, WetPlaceholder, WetLanguage } from "../wetInterfaces";

const whiteSpace = /\s/;
const allowedEscapeChars: { [s: string]: string } = {
    "b": "\b",
    "f": "\f",
    "r": "\r",
    "n": "\n",
    "t": "\t",
    "u": "\\u", // fixme: needs to be written back correctly.
    "\"": "\"",
    "\\": "\\"
};

function parsePlaceholder(parser: MessagesParser) {
    const name = parser.readQuotedString();
    parser.expectChar(":");
    parser.expectChar("{");
    const result: WetPlaceholder = {
        name,
        content: "",
        example: ""
    };
    do {
        const key = parser.readQuotedString();
        parser.expectChar(":");
        if (key === "content")
            result.content = parser.readQuotedString();
        else if (key === "example")
            result.example = parser.readQuotedString();
        else
            console.warn(`Found unknown key '${key}' at ${parser.getPosition()}, will be ignored`);
    } while (parser.isChar(",", true));
    parser.expectChar("}");
    return result;
}

function parseMessage(parser: MessagesParser) {
    const name = parser.readQuotedString();
    parser.expectChar(":");
    parser.expectChar("{");
    const result: WetMessage = {
        group: name.startsWith("__WET_GROUP__"),
        name,
        message: ""
    };
    do {
        const key = parser.readQuotedString();
        parser.expectChar(":");
        if (key === "message")
            result.message = parser.readQuotedString();
        else if (key === "description")
            result.description = parser.readQuotedString();
        else if (key === "hash")
            result.hash = parser.readQuotedString();
        else if (key === "placeholders") {
            parser.expectChar("{");
            if (!parser.isChar("}", true)) {
                if (!result.placeholders)
                    result.placeholders = [];
                do {
                    result.placeholders.push(parsePlaceholder(parser));
                } while (parser.isChar(",", true));
                parser.expectChar("}");
            }
        } else {
            console.warn(`Found unknown key '${key}' at ${parser.getPosition()}, will be ignored`);
        }
    } while (parser.isChar(",", true));
    parser.expectChar("}");
    return result;
}

export function parseMessagesFile(locale: string, fileContent: string) {
    const language: WetLanguage = {
        locale,
        label: locale,
        messages: [],
        messagesByKey: {}
    };

    const parser = new MessagesParser(locale, fileContent);
    parser.expectChar("{");
    if (!parser.isChar("}", true)) {
        do {
            const msg = parseMessage(parser);
            language.messages.push(msg);
            if (!msg.group)
                language.messagesByKey[msg.name] = msg;
        } while (parser.isChar(",", true));
        parser.expectChar("}");
    }
    return language;
}

class MessagesParser {
    private readonly locale: string;
    private lines: string[] = [];
    private line: number = 0;
    private lineContent: string = "";
    private column: number = 0;

    public constructor(locale: string, fileContent: string) {
        this.locale = locale;
        this.lines = fileContent.split(/\r\n|\r|\n/);
        this.lineContent = this.lines[0] || "";
    }

    public isChar(c: string, swallow?: boolean): boolean {
        if (!this.skipWhiteSpaces())
            return false;
        const result = this.lineContent[this.column] === c;
        if (result && swallow)
            this.column++;
        return result;
    }

    public getPosition() {
        return `${this.locale}/messages.json:${this.getLine()}:${this.getColumn()}`;
    }

    public expectChar(expected: string) {
        if (!this.skipWhiteSpaces())
            throw new Error(`Expected '${expected}', found [EOF] at ${this.getPosition()}`);
        const actual = this.lineContent[this.column];
        if (actual !== expected)
            throw new Error(`Expected '${expected}', found '${actual}' at ${this.getPosition()}`);
        this.column++;
    }

    public readQuotedString() {
        this.expectChar("\"");
        let token = "";
        while (this.column < this.lineContent.length) {
            const c = this.lineContent[this.column];
            // Check for escape characters
            if (c === "\\") {
                const c2 = this.lineContent[++this.column];
                const escaped = allowedEscapeChars[c2] || c2;
                token += escaped;
                this.column++;
                continue;
            }
            // done?
            else if (c === "\"") {
                this.column++;
                return token;
            }

            token += c;
            this.column++;
        }
        throw new Error(`Unexpected end of line at ${this.getPosition()}`);
    }

    public getLine(): number {
        return this.line + 1;
    }

    public getColumn(): number {
        return this.column;
    }

    private skipWhiteSpaces() {
        while (this.line < this.lines.length) {
            if (this.column >= this.lineContent.length) {
                this.line++;
                this.lineContent = (this.lines[this.line] || "").trim();
                this.column = 0;
                if (this.line >= this.lines.length)
                    return false;
            }
            while (this.column < this.lineContent.length) {
                if (!whiteSpace.test(this.lineContent[this.column]))
                    return true;
                this.column++;
            }
        }
        return false;
    }
}
