import React, { useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux-nano";
import MarkdownIt from "markdown-it";

import { selectAppBridge } from "../../redux/selectors";

const md = new MarkdownIt();

interface MarkdownProps {
    className?: string;
    markdown: string;
}

function renderMarkdown(markdown: string) {
    return md.render(markdown);
}

export default ({ className, markdown }: MarkdownProps) => {
    const ref = useRef<HTMLDivElement>();
    const appBridge = useSelector(selectAppBridge);
    const content = useMemo(() => ({ __html: markdown ? renderMarkdown(markdown) : "" }), [markdown]);

    useEffect(() => {
        const links = ref.current.querySelectorAll("a");
        links.forEach((link) => {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        });
        if (appBridge) {
            const onClick = (e: MouseEvent) => {
                e.preventDefault();
                if (e.target) appBridge.openBrowser((e.currentTarget as HTMLAnchorElement).href);
            };
            links.forEach((link) => link.addEventListener("click", onClick));
            return () => links.forEach((link) => link.removeEventListener("click", onClick));
        }
    }, [appBridge, content]);

    return <div ref={ref} className={className} dangerouslySetInnerHTML={content} />;
};
