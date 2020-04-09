import { combineReducers, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";

import { previewReducer } from "./preview/reducer";
import { extensionReducer } from "./extension/reducer";
import { webExtensionReducer } from "./webExtension/reducer";

export default () =>
    createStore(
        combineReducers({
            preview: previewReducer,
            extension: extensionReducer,
            webExtension: webExtensionReducer,
        }),
        composeWithDevTools()
    );
