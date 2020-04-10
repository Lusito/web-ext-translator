import React from "react";
import { WetMessage, WetLanguage } from "web-ext-translator-shared";

import TranslationEditor from "../TranslationEditor";
import { hashFor } from "../../../utils/getHashFor";
import TranslationTablePlus from "../TranslationTablePlus";
import { useAppBridge } from "../../../AppBridge";

interface TranslationTableRowProps {
    className?: string;
    mainLanguage: WetLanguage;
    firstLanguage: WetLanguage | null;
    secondLanguage: WetLanguage | null;
    message: WetMessage;
}

function getData(mainLanguage: WetLanguage, mainHash: string, lang: WetLanguage | null, key: string) {
    const message = lang?.messagesByKey[key];
    return {
        value: message?.message || "",
        modified: mainLanguage !== lang && (!message || !message.hash || message.hash !== mainHash),
    };
}

export default ({ className, message, firstLanguage, secondLanguage, mainLanguage }: TranslationTableRowProps) => {
    const appBridge = useAppBridge();
    const mainHash = hashFor(message.message);
    const first = getData(mainLanguage, mainHash, firstLanguage, message.name);
    const second = getData(mainLanguage, mainHash, secondLanguage, message.name);

    return (
        <tr className={`translation-table-body__row ${className}`} title={message.description}>
            <td className="translation-table-body__td" data-searchable={message.name}>
                {message.name}
            </td>
            <td className="translation-table-body__td">
                <TranslationEditor
                    value={first.value}
                    messageKey={message.name}
                    placeholders={message.placeholders}
                    locale={firstLanguage?.locale}
                    modified={first.modified}
                />
            </td>
            <td className="translation-table-body__td">
                <TranslationEditor
                    value={second.value}
                    messageKey={message.name}
                    placeholders={message.placeholders}
                    locale={secondLanguage?.locale}
                    modified={second.modified}
                />
            </td>
            {appBridge && (
                <td className="translation-table-body__td">
                    <TranslationTablePlus messageName={message.name} />
                </td>
            )}
        </tr>
    );
};
