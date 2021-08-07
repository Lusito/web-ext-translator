import browser from "webextension-polyfill";
import { WetMessage, WetLanguage, WetPlaceholder } from "web-ext-translator-shared";

const CONTENT_INDEX = /^\$[0-9]*$/;
const PLACEHOLDER = /\$(.*?)\$/g;

export type UpdateListener = () => void;

export class WetLayer {
    private updateListeners: UpdateListener[] = [];

    private locale = "";

    private map: { [s: string]: WetMessage } = {};

    constructor() {
        browser.runtime.onMessage.addListener((request) => {
            if (request && request.action === "WetApplyLanguage") this.applyLanguage(request.language);
        });
    }

    public loadFromStorage() {
        browser.storage.local.get(["wet-locale", "wet-map"]).then((data) => {
            this.locale = data["wet-locale"] || "";
            this.map = data["wet-map"] || {};
            this.notifyListeners();
        });
    }

    public addListener(listener: UpdateListener) {
        if (!this.updateListeners.includes(listener)) this.updateListeners.push(listener);
    }

    public removeListener(listener: UpdateListener) {
        this.updateListeners = this.updateListeners.filter((l) => l !== listener);
    }

    private notifyListeners() {
        this.updateListeners.forEach((listener) => listener());
    }

    private applyLanguage(language: WetLanguage) {
        this.locale = language.locale;
        this.map = language.messagesByKey;
        browser.storage.local.set({ "wet-locale": this.locale, "wet-map": this.map });
        this.notifyListeners();
    }

    public reset() {
        this.map = {};
        this.locale = "";
        browser.storage.local.remove(["wet-locale", "wet-map"]);
        this.notifyListeners();
    }

    public getMessage(messageName: string, substitutions?: string | string[]) {
        const message = this.map[messageName];
        const messageText = message?.message;
        if (messageText) {
            const normalizedSubstitutions = typeof substitutions === "string" ? [substitutions] : substitutions;
            const { placeholders } = message;
            if (placeholders && normalizedSubstitutions) {
                const normalizedPlaceholders: { [s: string]: WetPlaceholder } = {};
                placeholders.forEach((ph) => {
                    normalizedPlaceholders[ph.name.toLowerCase()] = ph;
                });

                return messageText.replace(PLACEHOLDER, (match, token) => {
                    const placeholder = normalizedPlaceholders[token.toLowerCase()];
                    if (placeholder?.content) {
                        if (CONTENT_INDEX.test(placeholder.content)) {
                            const index = parseInt(placeholder.content.substr(1)) - 1;
                            if (index < normalizedSubstitutions.length) return normalizedSubstitutions[index];
                        }
                        return placeholder.content;
                    }
                    return `$${token}$`;
                });
            }
            return messageText;
        }
        return browser.i18n.getMessage(messageName, substitutions);
    }

    public getUILanguage() {
        return this.locale || browser.i18n.getUILanguage();
    }

    public getAcceptLanguages() {
        return browser.i18n.getAcceptLanguages();
    }

    public detectLanguage(text: string) {
        return browser.i18n.detectLanguage(text);
    }
}

export const wetLayer = new WetLayer();
