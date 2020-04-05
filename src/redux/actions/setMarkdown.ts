import { State } from "../State";

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
