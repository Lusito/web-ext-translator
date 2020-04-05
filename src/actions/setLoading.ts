import { State } from "../shared";

export interface WetActionSetLoading {
    type: "SET_LOADING";
    payload: string;
}

export function handleSetLoading(state: State, payload: string): State {
    return { ...state, loading: payload };
}
