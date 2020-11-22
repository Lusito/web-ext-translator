import React from "react";
import { WetMessageType } from "web-ext-translator-shared";
import { useSelector } from "react-redux-nano";

import TranslationTableRow from "../TranslationTableRow";
import { selectExtension } from "../../../redux/extension";
import TranslationTableSection from "../TranslationTableSection";
import "./style.css";

export default () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const extension = useSelector(selectExtension)!;

    const firstLanguage = extension.firstLocale ? extension.languages[extension.firstLocale] : null;
    const secondLanguage = extension.secondLocale ? extension.languages[extension.secondLocale] : null;
    const rows = extension.mainLanguage.messages.map((message, index) =>
        message.type !== WetMessageType.MESSAGE ? (
            <TranslationTableSection
                key={message.name.startsWith("__WET_GROUP__") ? `${message.name}/${index}` : message.name}
                message={message}
            />
        ) : (
            <TranslationTableRow
                key={message.name}
                message={message}
                firstLanguage={firstLanguage}
                secondLanguage={secondLanguage}
                mainLanguage={extension.mainLanguage}
            />
        )
    );
    return <div className="translation-table-body">{rows}</div>;
};
