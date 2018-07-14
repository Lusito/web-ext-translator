/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { WetLanguage, WetMessageType } from "../wetInterfaces";
import { localeCodeToEnglish } from "../lib/localeCodeToEnglish";
import { hashForLanguage } from "./getHashFor";

/**
 * Updates both the the message hash if not set and the language label
 */
export function normalizeLanguages(languages: WetLanguage[], mainLanguage: WetLanguage) {
    languages.forEach((language) => {
        const l2e = localeCodeToEnglish(language.locale);
        language.label = l2e.found ? l2e.name : language.locale;
        language.messages = language.messages.filter((m) => m.name !== "__WET_LOCALE__" && m.name !== "__WET_FORMATTER__");
        const isMainLanguage = language === mainLanguage;

        for (const message of language.messages) {
            if (message.type === WetMessageType.MESSAGE) {
                if (isMainLanguage)
                    message.hash = "";
                else if (!message.hash)
                    message.hash = hashForLanguage(mainLanguage, message.name);
            }
        }
    });
}
