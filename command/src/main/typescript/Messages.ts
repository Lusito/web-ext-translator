/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { localeCodeToEnglish } from './lib/localeCodeToEnglish';

export interface TranslationPlaceholder {
    name: string;
    content: string;
    example: string;
}

export interface TranslationMessage {
    name: string;
    message: string;
    description: string;
    placeholders: TranslationPlaceholder[];
}

export class Messages {
    private locale: string;
    private name: string;
    private messages: TranslationMessage[] = [];
    private messageMap: { [s: string]: TranslationMessage } = {};

    public constructor(locale: string) {
        this.locale = locale;
        const result = localeCodeToEnglish(locale);
        this.name = result.found ? result.name : 'Unknown';
    }

    public getLocale() {
        return this.locale;
    }

    public getName() {
        return this.name;
    }

    public rename(fromKey: string, toKey: string) {
        let message = this.messageMap[fromKey];
        if (message) {
            message.name = toKey;
            delete this.messageMap[fromKey];
            this.messageMap[toKey] = message;
        }
    }

    public get(name: string) {
        let message = this.messageMap[name];
        if (!message) {
            message = { name, message: '', description: '', placeholders: [] };
            this.messageMap[name] = message;
            this.messages.push(message);
        }
        return message;
    }

    public set(name: string, message: string) {
        this.get(name).message = message;
    }

    public getKeys() {
        return this.messages.map((msg) => msg.name);
    }

    public addMessage(message: TranslationMessage) {
        if (this.messageMap.hasOwnProperty(message.name)) {
            const msg = this.messageMap[message.name];
            msg.message = message.message;
            msg.description = message.description;
        } else {
            this.messageMap[message.name] = message;
            this.messages.push(message);
        }
    }
}
