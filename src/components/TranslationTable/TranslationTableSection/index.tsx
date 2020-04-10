import React from "react";
import { WetMessage } from "web-ext-translator-shared";

import TranslationTablePlus from "../TranslationTablePlus";
import { useAppBridge } from "../../../AppBridge";
import "./style.css";

interface TranslationTableSectionProps {
    message: WetMessage;
}

export default ({ message }: TranslationTableSectionProps) => {
    const appBridge = useAppBridge();
    return (
        <div className="translation-table-section">
            <div className="translation-table-section__cell" data-searchable={message.message}>
                {message.message}
            </div>
            {appBridge && (
                <div className="translation-table-section__cell">
                    <TranslationTablePlus messageName={message.name} />
                </div>
            )}
        </div>
    );
};
