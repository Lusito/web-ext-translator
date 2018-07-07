/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
import { WetMessage, WetLanguage } from "../../../wetInterfaces";
import TranslationEditor from "../TranslationEditor/index";

interface TranslationTableRowProps {
    className?: string;
    firstLanguage: WetLanguage | null;
    secondLanguage: WetLanguage | null;
    message: WetMessage;
}

function getValue(message: WetMessage | null) {
    return message && message.message || "";
}

export function TranslationTableRow({ className, message, firstLanguage, secondLanguage }: TranslationTableRowProps) {
    const firstValue = getValue(firstLanguage && firstLanguage.messagesByKey[message.name]);
    const secondValue = getValue(secondLanguage && secondLanguage.messagesByKey[message.name]);
    return <tr className={`translation-table-body__row ${className}`} title={message.description}>
        <td className="translation-table-body__td">{message.name}</td>
        <td className="translation-table-body__td">
            <TranslationEditor value={firstValue} messageKey={message.name} placeholders={message.placeholders} locale={firstLanguage && firstLanguage.locale} />
        </td>
        <td className="translation-table-body__td">
            <TranslationEditor value={secondValue} messageKey={message.name} placeholders={message.placeholders} locale={secondLanguage && secondLanguage.locale} />
        </td>
    </tr>;
}
