import { iso_639_1, iso_639_2 } from "iso-639";
import countryList from "country-list";

type LocaleResult = { found: false; error: string } | { found: true; name: string };

const names = ["en", "de", "fr"] as const;

function getIso639Name(locale: string) {
    const first = iso_639_1[locale];
    if (first) {
        if (first.name === first.nativeName) return `${first.name}`;
        return `${first.name} (${first.nativeName})`;
    }
    const second = iso_639_2[locale];
    if (second) {
        for (const lang of names) {
            if (second[lang].length) return second[lang][0];
        }
        return `${locale} (No name available)`;
    }
    return null;
}

export function localeCodeToEnglish(loc: string): LocaleResult {
    if (!loc) return { found: false, error: "Input must not be empty" };
    if (typeof loc !== "string") return { found: false, error: "Input must be string" };
    const parts = loc.split("-");
    if (parts.length > 2) return { found: false, error: `Unexpected number of segments ${parts.length}` };
    const language = getIso639Name(parts[0]);
    if (!language) return { found: false, error: "Language not found in ISO 639" };

    if (parts.length === 2) {
        const country = countryList.getName(parts[1]);
        if (!country) return { found: false, error: "Country not found in ISO 3166-1" };
        return { found: true, name: `${language}, ${country}` };
    }
    return { found: true, name: language };
}
