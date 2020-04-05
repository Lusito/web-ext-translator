/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import { WetMessageType } from "web-ext-translator-shared";
import { useSelector } from "react-redux-nano";

import TranslationTableRow from "../TranslationTableRow";
import TranslationTablePlus from "../TranslationTablePlus";
import { selectExtension, selectAppBridge } from "../../../selectors";
import "./style.css";

export default () => {
    const extension = useSelector(selectExtension);
    const appBridge = useSelector(selectAppBridge);

    const firstLanguage = extension.firstLocale ? extension.languages[extension.firstLocale] : null;
    const secondLanguage = extension.secondLocale ? extension.languages[extension.secondLocale] : null;
    const rows = extension.mainLanguage.messages.map((message) => {
        if (message.type !== WetMessageType.MESSAGE) {
            const key = message.name.startsWith("__WET_GROUP__") ? message.name + message.message : message.name;
            return (
                <tr className="translation-table-body__section" key={key}>
                    <th colSpan={3} className="translation-table-body__th" data-searchable={message.message}>
                        {message.message}
                    </th>
                    {appBridge && (
                        <th className="translation-table-body__th">
                            <TranslationTablePlus messageName={message.name} />
                        </th>
                    )}
                </tr>
            );
        }
        return (
            <TranslationTableRow
                key={message.name}
                message={message}
                firstLanguage={firstLanguage}
                secondLanguage={secondLanguage}
                mainLanguage={extension.mainLanguage}
            />
        );
    });
    return (
        <div className="translation-table-body">
            <table className="translation-table-body__table">
                <tbody>{rows}</tbody>
            </table>
        </div>
    );
};
