declare module 'iso-639' {
    interface Iso639_1 {
        "639-1": string;
        "639-2": string;
        "639-2/B": string | undefined;
        family: string;
        name: string;
        nativeName: string;
        wikiUrl: string;
    }
    interface Iso639_2 {
        "639-1": string | undefined;
        "639-2": string;
        "639-2/B": string | undefined;
        de: string[];
        en: string[];
        fr: string[];
        wikiUrl?: string;
    }
    export const iso_639_1: { [s: string]: Iso639_1 }
    export const iso_639_2: { [s: string]: Iso639_2 }
}
