// tslint:disable-next-line:no-submodule-imports
import "regenerator-runtime";
import "font-awesome/css/font-awesome.min.css";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux-nano";

import store from "./redux/store";
import WetApp from "./components/WetApp";
import WebExtensionLoader from "./components/WebExtensionLoader";
import AppBridgeLoader from "./components/AppBridgeLoader";
import "./style.css";
import ParameterLoader from "./components/ParameterLoader";

ReactDOM.render(
    <Provider store={store}>
        <WetApp />
        <AppBridgeLoader />
        <WebExtensionLoader />
        <ParameterLoader />
    </Provider>,
    document.getElementById("root") as HTMLElement
);
