import React from "react";
import { useSelector } from "@react-nano/redux";

import Toolbar from "../Toolbar";
import MarkdownPreview from "../MarkdownPreview";
import TranslationTable from "../TranslationTable";
import LoadingScreen from "../LoadingScreen";
import MarkdownScreen from "../MarkdownScreen";
import { selectExtension, selectLoading } from "../../redux/extension";
import PortalGoal from "../Portal/PortalGoal";
import { useAppBridge } from "../../AppBridge";

const webAppWelcomeScreenMarkdown = `\
## Welcome!
This tool allows you to translate web-extensions. To get started, try:
- Load a Web-Extension with a Github URL, for example: [https://github.com/lusito/forget-me-not/tree/develop](?gh=https://github.com/lusito/forget-me-not/tree/develop)
- Upload a Web-Extension ZIP file.
- Then you can edit translations, add new languages and export them to a zip file.
- All without registration!
- Alternatively, you can try the standalone desktop version

If you are an extension developer, check out the [Github page](https://github.com/Lusito/web-ext-translator) to see how you can enable special support for your extension.
`;

const appWelcomeScreenMarkdown = `\
## Welcome!
This tool allows you to translate web-extensions. To get started, follow these steps:
- Either start \`wet\` from the root of your web-extension directory (where your \`_locales\` directory is located).
- Or use the "Open a directory" toolbar button, which will launch a new window.
- Then you can edit translations, add new languages and then save them to the disk.
- Alternatively, you can try the [WebApp](https://lusito.github.io/web-ext-translator/).

If you are an extension developer, check out the [Github page](https://github.com/Lusito/web-ext-translator) to see how you can enable special support for your extension.
`;

export default () => {
    const appBridge = useAppBridge();
    const loading = useSelector(selectLoading);
    const extension = useSelector(selectExtension);
    const welcomeScreenMarkdown = appBridge ? appWelcomeScreenMarkdown : webAppWelcomeScreenMarkdown;

    return (
        <>
            {loading ? (
                <LoadingScreen label={loading} />
            ) : (
                <>
                    <main>
                        <Toolbar />
                        {extension ? <TranslationTable /> : <MarkdownScreen markdown={welcomeScreenMarkdown} />}
                    </main>
                    <MarkdownPreview />
                </>
            )}
            <PortalGoal id="overlays" />
        </>
    );
};
