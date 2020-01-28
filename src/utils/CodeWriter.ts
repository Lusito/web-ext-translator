/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

export interface CodeWriterOptions {
    lineSeparator?: string;
    indentationStep?: string;
    insertFinalNewline?: boolean;
}

export class CodeWriter {
    private readonly lines: string[] = [];
    private lastIsEmpty = true;
    private commentLines = 0;
    private indentation = "";

    private lineSeparator: string;
    private indentationStep: string;
    private insertFinalNewline: boolean;

    constructor ({ lineSeparator = "\n", indentationStep = "    ", insertFinalNewline = true }: CodeWriterOptions) {
        this.lineSeparator = lineSeparator;
        this.indentationStep = indentationStep;
        this.insertFinalNewline = insertFinalNewline;
    }

    public begin(line: string) {
        if (this.commentLines > 0) {
            if (this.lastIsEmpty)
                this.lines.pop();
            this.lines.push(this.indentation + " */");
            this.commentLines = 0;
        }
        this.lines.push(this.indentation + line);
        this.indentation += this.indentationStep;
        this.lastIsEmpty = false;
    }

    public end(line: string) {
        if (this.commentLines > 0)
            throw new Error("Comment before block end");
        if (this.lastIsEmpty) {
            this.lines.pop();
            this.lastIsEmpty = false;
        }

        if (this.indentation.length < this.indentationStep.length) {
            throw new Error("Indentation too low");
        }

        this.indentation = this.indentation.substr(0, this.indentation.length - this.indentationStep.length);
        this.lines.push(this.indentation + line);
    }

    public comment(line: string) {
        if (!line)
            return;
        if (this.commentLines === 0) {
            if (!this.lastIsEmpty)
                this.lines.push("");
            this.lines.push(this.indentation + "/**");
        }
        this.lines.push(this.indentation + " * " + line);
        this.commentLines++;
        this.lastIsEmpty = false;
    }

    public code(line: string) {
        if (this.commentLines > 0) {
            if (this.lastIsEmpty) {
                this.lines.pop();
                this.lastIsEmpty = false;
            }
            this.lines.push(this.indentation + " */");
            this.commentLines = 0;
        }
        this.lines.push(this.indentation + line);
        this.lastIsEmpty = false;
    }

    public emptyLine() {
        if (!this.lastIsEmpty) {
            if (this.commentLines > 0) {
                this.lines.push(this.indentation + " *");
            } else if (this.insertFinalNewline) {
                this.lines.push("");
            }
            this.lastIsEmpty = true;
        }
    }

    public toString() {
        return this.lines.join(this.lineSeparator);
    }
}
