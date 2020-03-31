/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import { WetMessageType } from "web-ext-translator-shared";

import LanguageSelect from "../../LanguageSelect";
import { LoadedExtension } from "../../../shared";
import "./style.css";

interface TranslationTableHeadProps {
    extension: LoadedExtension;
}

export default function TranslationTableHead({ extension }: TranslationTableHeadProps) {
    const longestKey = extension.mainLanguage.messages.reduce(
        (longest, msg) =>
            msg.type === WetMessageType.MESSAGE && longest.length < msg.name.length ? msg.name : longest,
        ""
    );
    return (
        <div className="translation-table-head">
            <table className="translation-table-head__table">
                <thead>
                    <tr>
                        <th className="translation-table-head__th">Key</th>
                        <th className="translation-table-head__th">
                            <LanguageSelect extension={extension} first tabIndex={1} />
                        </th>
                        <th className="translation-table-head__th">
                            <LanguageSelect extension={extension} first={false} tabIndex={2} />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="translation-table-head__td">{longestKey}</td>
                        <td className="translation-table-head__td" />
                        <td className="translation-table-head__td" />
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
