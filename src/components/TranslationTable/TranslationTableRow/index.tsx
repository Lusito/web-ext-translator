import React from "react";
import { WetMessage, WetLanguage } from "web-ext-translator-shared";

import TranslationEditor from "../TranslationEditor";
import { hashFor } from "../../../utils/getHashFor";
import TranslationTablePlus from "../TranslationTablePlus";
import { useAppBridge } from "../../../AppBridge";
import "./style.css";

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
        <div className={`translation-table-row ${className}`} title={message.description}>
            <div className="translation-table-row__cell" data-searchable={message.name}>
                {message.name}
            </div>
            <div className="translation-table-row__cell">
                <TranslationEditor
                    value={first.value}
                    messageKey={message.name}
                    placeholders={message.placeholders}
                    locale={firstLanguage?.locale}
                    modified={first.modified}
                />
            </div>
            <div className="translation-table-row__cell">
                <TranslationEditor
                    value={second.value}
                    messageKey={message.name}
                    placeholders={message.placeholders}
                    locale={secondLanguage?.locale}
                    modified={second.modified}
                />
            </div>
            {appBridge && (
                <div className="translation-table-row__cell">
                    <TranslationTablePlus messageName={message.name} />
                </div>
            )}
        </div>
    );
};
