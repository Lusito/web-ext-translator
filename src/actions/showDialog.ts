import { State } from "../shared";

export interface WetActionShowDialog {
    type: "SHOW_DIALOG";
    payload: JSX.Element;
}

export function handleShowDialog(state: State, payload: JSX.Element): State {
    return { ...state, dialogs: state.dialogs.concat(payload) };
}
