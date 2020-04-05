/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";

import Markdown from "../Markdown";
import "./style.css";

interface MarkdownScreenProps {
    markdown: string;
}

export default ({ markdown }: MarkdownScreenProps) => (
    <div className="MarkdownScreen">
        <div className="MarkdownScreen__center">
            <Markdown markdown={markdown} />
        </div>
    </div>
);
