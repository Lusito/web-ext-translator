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
}

function MarkdownPreview({ previewVisible, markdown }: MarkdownPreviewStateProps) {
    return <div className={previewVisible ? "markdown-preview is-visible" : "markdown-preview"}>
        <h2 className="markdown-preview__title">Markdown Preview</h2>
        <Markdown className="markdown-preview__content" markdown={previewVisible ? markdown : "" } />
    </div>;
}

function mapStateToProps({ previewVisible, markdown }: State) {
    return {
        previewVisible,
        markdown
    };
}

export default connect<MarkdownPreviewStateProps>(mapStateToProps)(MarkdownPreview);
