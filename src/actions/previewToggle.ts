/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { State } from "../shared";

export interface WetActionPreviewToggle {
    type: "PREVIEW_TOGGLE";
    payload: null;
}

export function handlePreviewToggle(state: State): State {
    return { ...state, previewVisible: !state.previewVisible };
}
