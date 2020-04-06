import { configureStore } from "deox";
import { combineReducers } from "redux";

import { previewReducer } from "./preview/reducer";
import { extensionReducer } from "./extension/reducer";
import { webExtensionReducer } from "./webExtension/reducer";

export default () =>
    configureStore({
        reducer: combineReducers({
            preview: previewReducer,
            extension: extensionReducer,
            webExtension: webExtensionReducer,
        }),
    });
