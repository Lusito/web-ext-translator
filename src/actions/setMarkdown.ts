/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { State } from "../shared";

export interface WetActionSetMarkdownPayload {
    markdown: string;
    rtl: boolean;
}

export interface WetActionSetMarkdown {
    type: "SET_MARKDOWN";
    payload: WetActionSetMarkdownPayload;
}

export function handleSetMarkdown(state: State, payload: WetActionSetMarkdownPayload): State {
    return { ...state, markdown: payload.markdown, markdownRTL: payload.rtl };
}
