/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { WetCodeWriterOptions } from "web-ext-translator-shared";

const defaultCodeWriterOptions: WetCodeWriterOptions = {
    lineSeparator: "\n",
    indentationStep: "    ",
    insertFinalNewline: true,
};

export class CodeWriter {
    private readonly lines: string[] = [];

    private lastIsEmpty = true;

    private commentLines = 0;

    private indentation = "";

    private options: WetCodeWriterOptions;

    constructor(options: Partial<WetCodeWriterOptions>) {
        this.options = {
            ...defaultCodeWriterOptions,
            ...options,
        };
    }

    public begin(line: string) {
        if (this.commentLines > 0) {
            if (this.lastIsEmpty) this.lines.pop();
            this.lines.push(`${this.indentation} */`);
            this.commentLines = 0;
        }
        this.lines.push(this.indentation + line);
        this.indentation += this.options.indentationStep;
        this.lastIsEmpty = false;
    }

    public end(line: string) {
        if (this.commentLines > 0) throw new Error("Comment before block end");
        if (this.lastIsEmpty) {
            this.lines.pop();
            this.lastIsEmpty = false;
        }

        if (this.indentation.length < this.options.indentationStep.length) throw new Error("Indentation too low");

        this.indentation = this.indentation.substr(0, this.indentation.length - this.options.indentationStep.length);
        this.lines.push(this.indentation + line);
    }

    public comment(line: string) {
        if (!line) return;
        if (this.commentLines === 0) {
            if (!this.lastIsEmpty) this.lines.push("");
            this.lines.push(`${this.indentation}/**`);
        }
        this.lines.push(`${this.indentation} * ${line}`);
        this.commentLines++;
        this.lastIsEmpty = false;
    }

    public code(line: string) {
        if (this.commentLines > 0) {
            if (this.lastIsEmpty) {
                this.lines.pop();
                this.lastIsEmpty = false;
            }
            this.lines.push(`${this.indentation} */`);
            this.commentLines = 0;
        }
        this.lines.push(this.indentation + line);
        this.lastIsEmpty = false;
    }

    public emptyLine() {
        if (!this.lastIsEmpty) {
            if (this.commentLines > 0) this.lines.push(`${this.indentation} *`);
            else if (this.options.insertFinalNewline) this.lines.push("");
            this.lastIsEmpty = true;
        }
    }

    public toString() {
        return this.lines.join(this.options.lineSeparator);
    }
}
