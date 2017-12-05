/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { Messages, TranslationMessage, TranslationPlaceholder } from './Messages';

const whiteSpace = /\s/;
const allowedEscapeChars: { [s: string]: string } = {
    'b': '\b',
    'f': '\f',
    'r': '\r',
    'n': '\n',
    't': '\t',
    '"': '\\"',
    '\\': '\\\\'
};

export function saveMessages(messages: Messages, orderedNames: string[]) {
    let out = orderedNames.map((name) => {
        const msg = messages.get(name);
        const attributes = ['"message": ' + JSON.stringify(msg.message)];
        if (msg.description)
            attributes.push('"description": ' + JSON.stringify(msg.description));
        if (msg.placeholders.length) {
            const placeholders: string[] = [];
            for (let ph of msg.placeholders) {
                placeholders.push(JSON.stringify(ph.name)
                    + ': { "content": ' + JSON.stringify(ph.content) + ', "example": ' + JSON.stringify(ph.example) + '}');
            }
            attributes.push('"placeholders": { ' + placeholders.join(', ') + ' }');
        }
        return '	' + JSON.stringify(msg.name) + ': { ' + attributes.join(', ') +  ' }';
    });
    return '{\n' + out.join(',\n') + '\n}\n';
}

function parsePlaceholder(parser: MessagesParser) {
    const name = parser.readQuotedString();
    parser.expectChar(":");
    parser.expectChar("{");
    const result: TranslationPlaceholder = {
        name: name,
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
    const result: TranslationMessage = {
        name: name,
        message: "",
        description: "",
        placeholders: []
    };
    do {
        const key = parser.readQuotedString();
        parser.expectChar(":");
        if (key === "message")
            result.message = parser.readQuotedString();
        else if (key === "description")
            result.description = parser.readQuotedString();
        else if (key === "placeholders") {
            parser.expectChar("{");
            if (!parser.isChar("}", true)) {
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

export function loadMessages(locale: string, fileContent: string) {
    const messages = new Messages(locale);

    const parser = new MessagesParser();
    parser.load(fileContent);
    parser.expectChar("{");
    if (!parser.isChar("}", true)) {
        do {
            messages.addMessage(parseMessage(parser));
        } while (parser.isChar(",", true));
        parser.expectChar("}");
    }
    return messages;
}

class MessagesParser {
    private lines: string[] = [];
    private line: number = 0;
    private lineContent: string = "";
    private column: number = 0;

    public load(fileContent: string): boolean {
        this.lines = fileContent.split(/\r\n|\r|\n/);
        this.lineContent = this.lines[0] || '';
        return true;
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
        return `${this.getLine()}:${this.getColumn()}`;
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
        this.expectChar('\"');
        let token = "";
        while (this.column < this.lineContent.length) {
            const c = this.lineContent[this.column];
            // Check for escape characters
            if (c === '\\') {
                const c2 = this.lineContent[++this.column];
                const escaped = allowedEscapeChars[c2];
                if (!escaped)
                    throw new Error(`Unknown escape: '${c2}' at ${this.getPosition()}`);
                token += escaped;
                this.column++;
                continue;
            }
            // done?
            else if (c === '\"') {
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
                this.lineContent = (this.lines[this.line] || '').trim();
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
