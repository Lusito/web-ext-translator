import { WetLanguage } from "../wetInterfaces";
import { x64 as murmurhash3jsx64 } from "murmurhash3js";

export const hashFor = murmurhash3jsx64.hash128;

export function hashForLanguage(mainLanguage: WetLanguage, key: string): string {
    return mainLanguage.messagesByKey[key] && hashFor(mainLanguage.messagesByKey[key].message) || "";
}
