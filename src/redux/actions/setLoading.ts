import { State } from "../State";

export interface WetActionSetLoading {
    type: "SET_LOADING";
    payload: string;
}

export function handleSetLoading(state: State, payload: string): State {
    return { ...state, loading: payload };
}
