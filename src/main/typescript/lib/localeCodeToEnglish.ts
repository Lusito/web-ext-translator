import * as ISO639_1 from 'iso-639-1';
import * as countryList from 'country-list';
const ISO3166_1 = countryList();

type LocaleResult = { found: false, error: string } | { found: true, name: string };

export function localeCodeToEnglish(loc: string): LocaleResult {
    if (!loc)
        return { found: false, error: 'Input must not be empty' };
    const parts = loc.split('-');
    if (typeof loc !== 'string')
        return { found: false, error: 'Input must be string' };
    if (parts.length > 2)
        return { found: false, error: 'Unexpected number of segments ' + parts.length };
    const language = ISO639_1.getName(parts[0]);
    if(!language)
        return { found: false, error: 'Language not found in ISO 639-1' };

    if (parts.length === 2) {
        const country = ISO3166_1.getName(parts[1]);
        if(!country)
            return { found: false, error: 'Country not found in ISO 3166-1' };
        return { found: true, name: language + ', ' + country };
    }
    return { found: true, name: language };
}
