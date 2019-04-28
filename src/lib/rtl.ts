const RTL_SET = new Set(["ar", "arc", "dv", "fa", "ha", "he", "khw", "ks", "ku", "ps", "ur", "yi"]);

export function isLocaleRTL(locale: string) {
    return RTL_SET.has(locale.split("-")[0].toLowerCase());
}
