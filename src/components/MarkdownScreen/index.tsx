/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
import "./style.css";
import Markdown from "../Markdown";

interface MarkdownScreenProps {
    markdown: string;
}

export function MarkdownScreen({ markdown }: MarkdownScreenProps) {
    return <div className="MarkdownScreen">
        <div className="MarkdownScreen__center">
            <Markdown markdown={markdown} />
        </div>
    </div>;
}
