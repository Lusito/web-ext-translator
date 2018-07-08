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
import { importFromGithub } from "./utils/importFromGithub";
import WetApp from "./components/WetApp";
import packageJSON from "../package.json";
import { WET_PROTOCOL_VERSION } from "./wetInterfaces";

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
    gh && importFromGithub(gh);
})();

window.wet = {
    version: packageJSON.version,
    protocolVersion: WET_PROTOCOL_VERSION,
    registerExtension: () => {
        console.error("Not implemented yet");
    },
    setBridge: (bridge) => store.dispatch({ type: "SET_APP_BRIDGE", payload: bridge })
};
