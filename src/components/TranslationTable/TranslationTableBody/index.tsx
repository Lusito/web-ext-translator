/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import "./style.css";
import { LoadedExtension } from "../../../shared";
import { TranslationTableRow } from "../TranslationTableRow";
import { WetMessageType } from "web-ext-translator-shared";
import { TranslationTablePlus } from "../TranslationTablePlus";

interface TranslationTableBodyProps {
    extension: LoadedExtension;
    showPlus: boolean;
}

export default function TranslationTableBody({ extension, showPlus }: TranslationTableBodyProps) {
    const firstLanguage = extension.firstLocale ? extension.languages[extension.firstLocale] : null;
    const secondLanguage = extension.secondLocale ? extension.languages[extension.secondLocale] : null;
    const rows = extension.mainLanguage.messages.map((message) => {
        if (message.type !== WetMessageType.MESSAGE) {
            const key = message.name.startsWith("__WET_GROUP__") ? message.name + message.message : message.name;
            return <tr className="translation-table-body__section" key={key}>
                <th colSpan={3} className="translation-table-body__th" data-searchable={message.message}>{message.message}</th>
                { showPlus ? <th className="translation-table-body__th"><TranslationTablePlus messageName={message.name} /></th> : null }
            </tr>;
        }
        return <TranslationTableRow key={message.name} message={message} firstLanguage={firstLanguage} secondLanguage={secondLanguage} mainLanguage={extension.mainLanguage} showPlus={showPlus} />;
    });
    return <div className="translation-table-body">
        <table className="translation-table-body__table">
            <tbody>{rows}</tbody>
        </table>
    </div>;
}
