import React from "react";
import { WetMessage } from "web-ext-translator-shared";

import TranslationTablePlus from "../TranslationTablePlus";
import { useAppBridge } from "../../../AppBridge";

interface TranslationTableSectionProps {
    message: WetMessage;
}

export default ({ message }: TranslationTableSectionProps) => {
    const appBridge = useAppBridge();
    return (
        <tr className="translation-table-body__section">
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
};
