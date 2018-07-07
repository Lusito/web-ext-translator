import * as JSZip from "jszip";
import { WetLanguage } from "../wetInterfaces";
import store from "../store";
import { parseMessagesFile } from "./parseMessagesFile";
import { normalizeLanguages } from "./normalizeLanguages";

export function importFromZip(zipFile: File) {
  if (zipFile.name.toLowerCase().endsWith(".zip")) {
    JSZip.loadAsync(zipFile).then((zip) => {
      const locales = zip.folder("_locales");
      const manifestFile = zip.file("manifest.json");
      manifestFile.async("text").then((manifestContent) => {
        const manifest = JSON.parse(manifestContent);
        const promises: Array<Promise<WetLanguage>> = [];
        locales.forEach((relativePath, zipEntry) => {
          if (zipEntry.dir) {
            const localeDir = zip.folder(zipEntry.name);
            const msgFile = localeDir.file("messages.json");
            if (msgFile) {
              console.log(msgFile.name);
              promises.push(msgFile.async("text").then((s) => parseMessagesFile(relativePath.substr(0, relativePath.length - 1), s)));
            }
          }
        });
        Promise.all(promises).then((languages) => {
          const mainLanguage = languages.find((r) => r.locale === manifest.default_locale) || null;
          if (mainLanguage) {
            normalizeLanguages(languages, mainLanguage);
            store.dispatch({ type: "LOAD", payload: { languages, mainLanguage } });
          }
        });
      });
    }, (e) => {
      console.error("Error reading " + zipFile.name + ": " + e.message);
    });
  } else {
    console.error("Not a zip: " + zipFile.name);
  }
}
