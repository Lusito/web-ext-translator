/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
import "./style.css";
import { connect } from "react-redux";
import { State } from "../../shared";
import * as MarkdownIt from "markdown-it";

const md = new MarkdownIt();

interface MarkdownPreviewProps {
    previewVisible: boolean;
    markdown: string;
}

export function renderMarkdown(markdown: string) {
    const div = document.createElement("div");
    div.innerHTML = md.render(markdown);
    const links = div.querySelectorAll("a");
    links.forEach((link) => link.target = "_blank");
    return div.innerHTML;
}

function MarkdownPreview({ previewVisible, markdown }: MarkdownPreviewProps) {
    return <div className={previewVisible ? "markdown-preview is-visible" : "markdown-preview"}>
        <h2 className="markdown-preview__title">Markdown Preview</h2>
        <div className="markdown-preview__content" dangerouslySetInnerHTML={{ __html: (previewVisible ? renderMarkdown(markdown) : "") }}></div>
    </div>;
}

function mapStateToProps({ previewVisible, markdown }: State) {
    return {
        previewVisible,
        markdown
    };
}

export default connect<MarkdownPreviewProps>(mapStateToProps)(MarkdownPreview);
