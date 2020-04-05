/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import { useSelector } from "react-redux-nano";

import Markdown from "../Markdown";
import { selectPreviewVisible, selectMarkdown, selectMarkdownRTL } from "../../selectors";
import "./style.css";

export default () => {
    const previewVisible = useSelector(selectPreviewVisible);
    const markdown = useSelector(selectMarkdown);
    const markdownRTL = useSelector(selectMarkdownRTL);
    let className = "markdown-preview";
    if (previewVisible) {
        className += " markdown-preview--is-visible";
        if (markdownRTL) className += " markdown-preview--is-rtl";
    }
    return (
        <div className={className}>
            <h2 className="markdown-preview__title">Markdown Preview</h2>
            <Markdown className="markdown-preview__content" markdown={previewVisible ? markdown : ""} />
        </div>
    );
};
