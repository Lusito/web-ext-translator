/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { State } from "../shared";

export interface WetActionSetLoading {
    type: "SET_LOADING";
    payload: string;
}

export function handleSetLoading(state: State, payload: string): State {
    return { ...state, loading: payload };
}
