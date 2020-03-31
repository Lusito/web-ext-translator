/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import { connect } from "react-redux";

import { State, LoadedExtension } from "../../shared";
import Toolbar from "../Toolbar";
import MarkdownPreview from "../MarkdownPreview";
import Dialogs from "../Dialogs";
import { TranslationTable } from "../TranslationTable";
import { LoadingScreen } from "../LoadingScreen";
import { MarkdownScreen } from "../MarkdownScreen";

const welcomeScreenMarkdown = `\
## Welcome!
This tool allows you to translate web-extensions. To get started, try:
- Load a Web-Extension with a Github URL, for example: [https://github.com/lusito/forget-me-not/tree/develop](?gh=https://github.com/lusito/forget-me-not/tree/develop)
- Upload a Web-Extension ZIP file.
- Then you can edit translations, add new languages and export them to a zip file.
- All without registration!

If you are an extension developer, check out the [Github page](https://github.com/Lusito/web-ext-translator) to see how you can enable special support for your extension.
`;

interface WetAppProps {
    loading: string;
    extension: LoadedExtension | null;
    showPlus: boolean;
}

function WetApp({ loading, extension, showPlus }: WetAppProps) {
    return (
        <>
            {loading && <LoadingScreen label={loading} />}
            {!loading && (
                <main>
                    <Toolbar />
                    {extension ? (
                        <TranslationTable extension={extension} showPlus={showPlus} />
                    ) : (
                        <MarkdownScreen markdown={welcomeScreenMarkdown} />
                    )}
                </main>
            )}
            {!loading && <MarkdownPreview />}
            <Dialogs />
        </>
    );
}

function mapStateToProps({ loading, extension, appBridge }: State) {
    return { loading, extension, showPlus: !!appBridge };
}

export default connect<WetAppProps>(mapStateToProps)(WetApp);
