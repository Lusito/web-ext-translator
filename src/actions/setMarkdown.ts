/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { State } from "../shared";

export interface WetActionSetMarkdown {
    type: "SET_MARKDOWN";
    payload: string;
}

export function handleSetMarkdown(state: State, payload: string): State {
    return { ...state, markdown: payload };
}
