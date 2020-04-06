import React from "react";
import { useSelector } from "react-redux-nano";

import Markdown from "../Markdown";
import "./style.css";
import { selectPreviewVisible, selectPreviewMarkdown, selectPreviewRTL } from "../../redux/preview";

export default () => {
    const previewVisible = useSelector(selectPreviewVisible);
    const markdown = useSelector(selectPreviewMarkdown);
    const rtl = useSelector(selectPreviewRTL);
    let className = "markdown-preview";
    if (previewVisible) {
        className += " markdown-preview--is-visible";
        if (rtl) className += " markdown-preview--is-rtl";
    }
    return (
        <div className={className}>
            <h2 className="markdown-preview__title">Markdown Preview</h2>
            <Markdown className="markdown-preview__content" markdown={previewVisible ? markdown : ""} />
        </div>
    );
};
