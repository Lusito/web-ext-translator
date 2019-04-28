/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
import "./style.css";
import { connect } from "react-redux";
import { State } from "../../shared";
import Markdown from "../Markdown";

interface MarkdownPreviewStateProps {
    previewVisible: boolean;
    markdown: string;
    markdownRTL: boolean;
}

function MarkdownPreview({ previewVisible, markdown, markdownRTL }: MarkdownPreviewStateProps) {
    let className = "markdown-preview";
    if (previewVisible) {
        className += " markdown-preview--is-visible";
        if (markdownRTL)
            className += " markdown-preview--is-rtl";
    }
    return <div className={className}>
        <h2 className="markdown-preview__title">Markdown Preview</h2>
        <Markdown className="markdown-preview__content" markdown={previewVisible ? markdown : ""} />
    </div>;
}

function mapStateToProps({ previewVisible, markdown, markdownRTL }: State) {
    return {
        previewVisible,
        markdown,
        markdownRTL
    };
}

export default connect<MarkdownPreviewStateProps>(mapStateToProps)(MarkdownPreview);
