/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import { connect } from "react-redux";
import MarkdownIt from "markdown-it";
import { WetAppBridge } from "web-ext-translator-shared";

import { State } from "../../shared";

const md = new MarkdownIt();

interface MarkdownProps {
    className?: string;
    markdown: string;
}

interface MarkdownStateProps {
    appBridge: WetAppBridge | null;
}

type MarkdownMergedProps = MarkdownProps & MarkdownStateProps;

function renderMarkdown(markdown: string) {
    return md.render(markdown);
}

class Markdown extends React.Component<MarkdownMergedProps> {
    private ref: HTMLDivElement | null = null;

    public constructor(props: MarkdownMergedProps, context?: any) {
        super(props, context);
        this.onRef = this.onRef.bind(this);
    }

    public render() {
        const { className, markdown } = this.props;
        return (
            <div
                ref={this.onRef}
                className={className}
                dangerouslySetInnerHTML={{ __html: markdown ? renderMarkdown(markdown) : "" }}
            />
        );
    }

    private onRef(e: HTMLDivElement) {
        this.ref = e;
    }

    public componentDidMount() {
        this.componentDidUpdate();
    }

    public componentDidUpdate() {
        if (this.ref) {
            const links = this.ref.querySelectorAll("a");
            links.forEach((link) => {
                link.target = "_blank";
            });
            const { appBridge } = this.props;
            if (appBridge) {
                const onClick = (e: MouseEvent) => {
                    e.preventDefault();
                    if (e.target) appBridge.openBrowser((e.currentTarget as HTMLAnchorElement).href);
                };
                links.forEach((link) => link.addEventListener("click", onClick));
            }
        }
    }
}

function mapStateToProps({ appBridge }: State) {
    return { appBridge };
}

export default connect<MarkdownStateProps, MarkdownProps>(mapStateToProps)(Markdown);
