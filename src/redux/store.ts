import { createStore } from "redux";

import { State } from "./State";
import { WetAction, reducer } from "./actions";

function getDefaultState(): State {
    return {
        dialogs: [],
        previewVisible: true,
        markdown: "",
        markdownRTL: false,
        loading: "",
        extension: null,
        webExtensionMode: false,
        appBridge: (window as any).electronBridge || null,
    };
}

const store = createStore<State, WetAction, {}, {}>(reducer, getDefaultState());

export default store;
