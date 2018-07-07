import { createStore } from "redux";
import { State } from "./shared";
import { WetAction, reducer } from "./actions";

function getDefaultState(): State {
    return {
        dialogs: [],
        previewVisible: true,
        markdown: "",
        loading: "",
        extension: null,
        appBridge: null
    };
}

const store = createStore<State, WetAction, {}, {}>(reducer, getDefaultState());

export default store;
