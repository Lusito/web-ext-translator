/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { EditorConfigSectionProps } from "../utils/editorConfig";

export class CodeWriter {
    private readonly lines: string[] = [];
    private lastIsEmpty = true;
    private commentLines = 0;
    private indentation = "";
    private indentationSize = 4;
    private editorConfig?: EditorConfigSectionProps;

    constructor (editorConfig?: EditorConfigSectionProps) {
        this.editorConfig = editorConfig;
        if (this.editorConfig && this.editorConfig.indent_size) {
            if (typeof this.editorConfig.indent_size === "number") {
                this.indentationSize = this.editorConfig.indent_size;
            }
        }
    }

    public begin(line: string) {
        if (this.commentLines > 0) {
            if (this.lastIsEmpty)
                this.lines.pop();
            this.lines.push(this.indentation + " */");
            this.commentLines = 0;
        }
        this.lines.push(this.indentation + line);

        if (this.editorConfig) {
            if (this.editorConfig.indent_style === "tab") {
                this.indentation += "\t";
            } else if (this.editorConfig.indent_style === "space") {
                for (let i = 0; i < this.indentationSize; i++) {
                    this.indentation += " ";
                }
            }
        } else {
            this.indentation += "    ";
        }

        this.lastIsEmpty = false;
    }

    public end(line: string) {
        if (this.commentLines > 0)
            throw new Error("Comment before block end");
        if (this.lastIsEmpty) {
            this.lines.pop();
            this.lastIsEmpty = false;
        }

        if (this.editorConfig && this.editorConfig.indent_style === "tab") {
            if (this.indentation.length < 1) {
                throw new Error("Indentation too low");
            }
            this.indentation = this.indentation.slice(1);
        } else {
            if (this.indentation.length < this.indentationSize) {
                throw new Error("Indentation too low");
            }
            this.indentation = this.indentation.substr(0, this.indentation.length - this.indentationSize);
        }

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
            if (this.commentLines > 0)
                this.lines.push(this.indentation + " *");
            else
                this.lines.push("");
            this.lastIsEmpty = true;
        }
    }

    public toString() {
        if (this.editorConfig) {
            if (this.editorConfig.insert_final_newline !== undefined) {
                if (this.editorConfig.insert_final_newline) {
                    if (!this.lastIsEmpty) {
                        this.lines.push("");
                    }
                } else if (this.lastIsEmpty) {
                    this.lines.pop();
                }
            }

            if (this.editorConfig.end_of_line === "lf") {
                return this.lines.join("\n");
            } else if (this.editorConfig.end_of_line === "crlf") {
                return this.lines.join("\r\n");
            }
        }

        return this.lines.join("\n");
    }
}
