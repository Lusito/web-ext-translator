/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

// tslint:disable-next-line:no-submodule-imports
import "font-awesome/css/font-awesome.min.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
import "./style.css";
import { adjustAllHeights } from "./utils/adjustHeights";
import { getParameter } from "./utils/getParameter";
import WetApp from "./components/WetApp";
import packageJSON from "../package.json";
import { WET_PROTOCOL_VERSION, WetAppBridge } from "./wetInterfaces";
import { github } from "./vcs";

ReactDOM.render(
    <Provider store={store}>
        <WetApp />
    </Provider>,
    document.getElementById("root") as HTMLElement
);

window.addEventListener("resize", adjustAllHeights);
adjustAllHeights();

(() => {
    const gh = getParameter("gh");
    gh && github.import(gh);
})();

function setBridge(bridge: WetAppBridge) {
    store.dispatch({ type: "SET_APP_BRIDGE", payload: bridge });

    // redirect console messages
    function createConsoleProxy(method: string) {
        return (...args: any[]) => {
            const message = args.map((v) => JSON.stringify(v)).join(", ");
            let stack: string | null = null;
            if (method === "error") {
                stack = new Error(message).stack || null;
            }
            bridge.consoleProxy(method, message, stack);
        };
    }

    for (const key in console)
        (console as any)[key] = createConsoleProxy(key);
}

window.wet = {
    version: packageJSON.version,
    protocolVersion: WET_PROTOCOL_VERSION,
    registerExtension: () => {
        console.error("Not implemented yet");
    },
    setBridge
};
