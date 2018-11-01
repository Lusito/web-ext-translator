/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

const ALLOWED_ESCAPE_CHARS: { [s: string]: string } = {
    "b": "\b",
    "f": "\f",
    "r": "\r",
    "n": "\n",
    "t": "\t",
    "u": "\\u", // special case for allowing editors to see \uXXXX unicode declarations
    "\"": "\"",
    "\\": "\\"
};

const WHITE_SPACE = /\s/;
const SINGLE_CHAR_TOKENS = /[\[|\]|\{|\}|,|\:]/;
const NUMERIC = /[0-9]/;
const NUMERIC_OR_MINUS = /[0-9|-]/;
const NUMERIC_END = /[\s|\]|\}|,\/]/;
const IDENTIFIER_CHARS = /[a-z]/;

interface MessageToken {
    line: number;
    column: number;
    content: string | number | boolean | null;
    type: "comment" | "string" | "number" | "boolean" | "null" | "char";
}

export class JsonTokenizer {
    private readonly resource: string;
    private lines: string[] = [];
    private line: number = 0;
    private lineContent: string = "";
    private column: number = 0;
    private lastChar: string | null = null;
    private lastToken: MessageToken | null = null;
    private currentToken: MessageToken;

    public constructor(resource: string, data: string) {
        this.resource = resource;
        this.lines = data.split(/\r\n|\r|\n/);
        this.lineContent = this.lines[0] || "";
        this.createNewToken();
    }

    public isDone() {
        return this.line >= this.lines.length;
    }

    private createNewToken(): MessageToken {
        return this.currentToken = {
            line: this.line,
            column: this.column,
            content: null,
            type: "null"
        };
    }

    public skipComments() {
        let token = this.next();
        while (token.type === "comment")
            token = this.next();
        return token;
    }

    public testCharToken(value: string) {
        // skip comments if a token is expected
        const token = this.skipComments();
        const invalid = token.content !== value || token.type !== "char";
        if (invalid)
            this.lastToken = token;
        return !invalid;
    }

    public expectCharToken(value: string) {
        if (!this.testCharToken(value))
            throw new Error(`Expected token '${value}', but got '${this.lastToken && this.lastToken.content}' at ${this.getTokenPosition()}`);
    }

    public expectValueToken(type: "number"): number;
    public expectValueToken(type: "string"): string;
    public expectValueToken(type: "boolean"): boolean;
    public expectValueToken(type: "number" | "string" | "boolean") {
        // skip comments if a token is expected
        const token = this.skipComments();
        if (token.type !== type)
            throw new Error(`Expected token of type '${type}', but got a '${token.type}' at ${this.getTokenPosition()}`);
        return token.content;
    }

    public tryValueToken(type: "number"): number | undefined;
    public tryValueToken(type: "string"): string | undefined;
    public tryValueToken(type: "boolean"): boolean | undefined;
    public tryValueToken(type: "number" | "string" | "boolean") {
        // skip comments if a token is expected
        const token = this.skipComments();
        if (token.type !== type) {
            this.lastToken = token;
            return undefined;
        }
        return token.content;
    }

    public next(): MessageToken {
        if (this.lastToken) {
            const token = this.lastToken;
            this.lastToken = null;
            return token;
        }

        this.skipWhiteSpaces();
        const token = this.createNewToken();
        const c = this.readChar(true) as string;
        if (c === "\"") {
            this.lastChar = c;
            token.content = this.readQuotedString();
            token.type = "string";
        } else if (SINGLE_CHAR_TOKENS.test(c)) {
            token.content = c;
            token.type = "char";
        } else if (NUMERIC_OR_MINUS.test(c)) {
            this.lastChar = c;
            token.content = this.readNumber();
            token.type = "number";
        } else if (IDENTIFIER_CHARS.test(c)) {
            token.content = this.readIdentifier(c);
            token.type = token.content === null ? "null" : "boolean";
        } else if (c === "/" && this.peekChar() === "/") {
            token.type = "comment";
            token.content = this.lineContent.substr(this.column + 1).trim();
            this.prepareNextLine();
        } else {
            throw new Error(`Unexpected character '${c}' at ${this.getPosition()}`);
        }
        return token;
    }

    private prepareNextLine() {
        this.column = 0;
        this.line++;
        this.lineContent = this.lines[this.line] || "";
    }

    private readChar(required: boolean) {
        if (this.lastChar !== null) {
            const c = this.lastChar;
            this.lastChar = null;
            return c;
        }

        if (this.column >= this.lineContent.length) {
            if (required)
                throw new Error(`Unexpected end of line at ${this.getPosition()}`);
            this.prepareNextLine();
            return null;
        }
        const c = this.lineContent[this.column++];
        if (WHITE_SPACE.test(c) && required)
            throw new Error(`Unexpected end of token at ${this.getPosition()}`);
        return c;
    }

    private peekChar(): string {
        return this.lastChar !== null ? this.lastChar : this.lineContent[this.column];
    }

    private readNumberChar(required: boolean) {
        const c = this.readChar(required);
        if (c === null)
            return null;

        if (NUMERIC_END.test(c)) {
            this.lastChar = c;
            return null;
        }
        return c;
    }

    private readDigits(chars: string[]): string | null {
        let c;
        do {
            c = this.readNumberChar(false);
            if (c === null)
                return null;
            chars.push(c);
        } while (NUMERIC.test(c));
        return c;
    }

    private readDigitsRequired(chars: string[]): string | null {
        const lengthBefore = chars.length;
        const c = this.readDigits(chars);
        if (lengthBefore === chars.length)
            throw new Error(`Expected a digit at ${this.getPosition()}`);
        return c;
    }

    private charsToNumber(chars: string[]) {
        const str = chars.join("");
        const num = parseFloat(str);
        if (isNaN(num))
            throw new Error(`Invalid number token '${str}' at ${this.getPosition()}`);
        return num;
    }

    private readNumber(): number {
        const chars = [];
        let c = this.readNumberChar(true);
        if (c === "-") {
            chars.push(c);
            c = this.readNumberChar(true);
            if (c === null)
                throw new Error(`Expected a digit, but got '${this.lastChar === null ? "<End Of Line>" : this.lastChar}' at ${this.getPosition()}`);
        }
        if (c === "0") {
            c = this.readNumberChar(false);
            if (c === null)
                return 0;
            if (NUMERIC.test(c as string))
                throw new Error(`Unexpected digit '${c}' after 0 at ${this.getPosition()}`);
        } else {
            if (!NUMERIC.test(c as string))
                throw new Error(`Unexpected character '${c}' at ${this.getPosition()}`);

            chars.push(c as string);
            c = this.readDigits(chars);
        }

        if (c === ".") {
            chars.push(c);
            c = this.readDigitsRequired(chars);
        }

        if (c === null || NUMERIC_END.test(c))
            return this.charsToNumber(chars);

        if (c !== "e" && c !== "E")
            throw new Error(`Expected a e or E, but got '${c}' at ${this.getPosition()}`);

        chars.push(c);
        c = this.readNumberChar(true);
        if (c !== "+" && c !== "-" && !NUMERIC.test(c as string))
            throw new Error(`Expected +,- or a digit, but got '${c}' at ${this.getPosition()}`);
        chars.push(c as string);
        c = this.readDigitsRequired(chars);

        if (c !== null)
            this.lastChar = c;
        return this.charsToNumber(chars);
    }

    private readIdentifier(firstChar: string): boolean | null {
        const id = this.readIdentifierChars(firstChar);
        switch (id) {
            case "true": return true;
            case "false": return false;
            case "null": return null;
        }
        throw new Error(`Unexpected identifier '${id}' at ${this.getTokenPosition()}`);
    }

    private readIdentifierChars(firstChar: string): string {
        const chars = [firstChar];
        while (this.column < this.lineContent.length) {
            const c = this.lineContent[this.column];
            if (!IDENTIFIER_CHARS.test(c))
                break;
            chars.push(c);
            this.column++;
        }
        return chars.join("");
    }

    public getPosition() {
        return `${this.resource}:${this.getLine()}:${this.getColumn()}`;
    }

    public getTokenPosition() {
        return `${this.resource}:${this.currentToken.line + 1}:${this.currentToken.column}`;
    }

    private expectChar(expected: string) {
        const actual = this.readChar(true);
        if (actual !== expected)
            throw new Error(`Expected '${expected}', found '${actual}' at ${this.getPosition()}`);
    }

    private readQuotedString() {
        this.expectChar("\"");
        let token = "";
        while (this.column < this.lineContent.length) {
            const c = this.lineContent[this.column];
            // Check for escape characters
            if (c === "\\") {
                const c2 = this.lineContent[++this.column];
                const escaped = ALLOWED_ESCAPE_CHARS[c2] || c2;
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

    private getLine(): number {
        return this.line + 1;
    }

    private getColumn(): number {
        return this.column;
    }

    private skipWhiteSpaces() {
        while (this.line < this.lines.length) {
            if (this.column >= this.lineContent.length) {
                this.prepareNextLine();
                if (this.line >= this.lines.length)
                    return false;
            }
            while (this.column < this.lineContent.length) {
                if (!WHITE_SPACE.test(this.lineContent[this.column]))
                    return true;
                this.column++;
            }
        }
        return false;
    }
}
