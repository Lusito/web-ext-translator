/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
import "./style.css";

export function WelcomeScreen() {
    return <div className="WelcomeScreen">
        <div className="WelcomeScreen__center">
            <div>
                <h2>Welcome!</h2>
                <p>This tool allows you to translate web-extensions. To get started, try:</p>
                <ul>
                    <li>Load a Web-Extension with a Github URL, for example: <a href="?gh=https://github.com/lusito/forget-me-not/tree/feature/wet">https://github.com/lusito/forget-me-not/tree/feature/wet</a></li>
                    <li>Upload a Web-Extension ZIP file.</li>
                    <li>Then you can edit translations, add new languages and export them to a zip file.</li>
                    <li>All without registration!</li>
                </ul>
                <p>If you are an extension developer, check out the <a href="https://github.com/Lusito/web-ext-translator" target="_blank">Github</a> page to see how you can enable special support for your extension.</p>
            </div>
        </div>
    </div>;
}
