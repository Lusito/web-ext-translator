/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

// tslint:disable-next-line:no-submodule-imports
import "regenerator-runtime";
import "font-awesome/css/font-awesome.min.css";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Provider, useSelector } from "react-redux";

import store from "./store";
import "./style.css";
import { getParameter } from "./utils/getParameter";
import WetApp from "./components/WetApp";
import { github } from "./vcs";
import { State } from "./shared";
import { loadFromAppBridge } from "./actions/setAppBridge";

const AppBridgeLoader = (): null => {
    const bridge = useSelector((state: State) => state.appBridge);
    useEffect(() => {
        if (bridge) loadFromAppBridge(bridge);
    }, [bridge]);
    return null;
};

ReactDOM.render(
    <Provider store={store}>
        <WetApp />
        <AppBridgeLoader />
    </Provider>,
    document.getElementById("root") as HTMLElement
);

(() => {
    const gh = getParameter("gh");
    gh && github.import(gh);
})();

window.addEventListener("message", (event) => {
    if (event.source === window && event.data && event.data.action === "EnableWebExtensionMode")
        store.dispatch({ type: "ENABLE_WEB_EXTENSION_MODE" });
});
