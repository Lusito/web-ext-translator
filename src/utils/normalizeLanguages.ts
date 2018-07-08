/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { WetLanguage } from "../wetInterfaces";
import { localeCodeToEnglish } from "../lib/localeCodeToEnglish";
import { x64 as murmurhash3jsx64 } from "murmurhash3js";
const { hash128 } = murmurhash3jsx64;

/**
 * Updates both the the message hash if not set and the language label
 */
export function normalizeLanguages(languages: WetLanguage[], mainLanguage: WetLanguage) {
    const getHashFor = (key: string) => mainLanguage.messagesByKey[key] && hash128(mainLanguage.messagesByKey[key].message);
    languages.forEach((language) => {
        const l2e = localeCodeToEnglish(language.locale);
        language.label = l2e.found ? l2e.name : language.locale;
        language.messages = language.messages.filter((m) => m.name !== "__WET_LOCALE__");
        if (language !== mainLanguage) {
            for (const message of language.messages) {
                if (!message.hash && !message.group)
                    message.hash = getHashFor(message.name);
            }
        }
    });
}
