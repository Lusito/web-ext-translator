import { createElement, createButton, on, byId, removeAllChildren } from './htmlUtils';
import { Messages } from '../Messages';
import { UndoManager } from 'typed-undo';
import * as dialogs from './dialogs';
import { UndoableMessageChange, UndoableMessageDrag, UndoableMessageAddRemove, RowEntry, UndoableLanguageChange, UndoableLanguageAddRemove, UndoableMessageRename } from './undoables';
import { Key } from 'ts-keycode-enum';
import * as dragula from 'dragula';
import * as MarkdownIt from 'markdown-it';
import * as toastr from 'toastr';
import * as $ from 'jquery';
import { localeCodeToEnglish } from '../lib/localeCodeToEnglish';
import { loadMessages, saveMessages } from '../messagesHelpers';
(window as any).jQuery = $;
import 'chosen-js';
import 'chosen-js/chosen.min.css';
import 'dragula/dist/dragula.min.css';
import 'toastr/build/toastr.min.css';
import '../style/style.css';

const languageSelects = [
    document.getElementById('language1') as HTMLSelectElement,
    document.getElementById('language2') as HTMLSelectElement
];
const entriesTBody = document.getElementById('entries') as HTMLElement;
const undoButton = (byId('undo') as HTMLButtonElement);
const redoButton = (byId('redo') as HTMLButtonElement);

const loadButton = byId('load') as HTMLButtonElement;
const saveAllButton = byId('saveAll') as HTMLButtonElement;
const newLanguageButton = byId('newLanguage') as HTMLButtonElement;
const newTranslationButton = byId('newTranslation') as HTMLButtonElement;
const previewPane = byId('preview') as HTMLElement;
const mainElement = document.querySelector('main') as HTMLElement;
const getDatasetKey = (el: HTMLElement | null) => el ? el.dataset.key as string : null;
const md = new MarkdownIt();

interface MessagesFile {
    locale: string;
    content: string;
}

interface MessagesListResult {
    files: (MessagesFile[]) | null;
    error: string | null;
}
interface JavaBridge {
    loadMessagesList(): MessagesListResult;
    saveMessagesList(list: MessagesFile[]): string | null;
    setDirty(dirty: boolean): void;
    openDirectory(): boolean;
}

const validName = /^[A-Za-z0-9_@]+$/;

function showError(title: string, message?: string | null) {
    toastr.error(message || 'Unknown error', title, {
        positionClass: 'toast-top-center'
    });
}

function showSuccess(title: string, message?: string) {
    toastr.success(message || '', title, {
        positionClass: 'toast-top-right'
    });
}

function attachTooltip(el: HTMLElement, value: string, align: 'left' | 'right') {
    el.setAttribute('data-tooltip', value);
    el.classList.add('tooltip_' + align);
}

class Translator {
    private bridge: JavaBridge = /* dummmy bridge for debugging outside of webkit */{
        loadMessagesList: () => { return { files: null, error: 'This is a dummy bridge' }; },
        saveMessagesList: () => null,
        setDirty: () => { },
        openDirectory: () => true
    };
    private readonly undoManager = new UndoManager();
    private rowMap: { [s: string]: RowEntry } = {};
    private messagesMap: { [s: string]: Messages } = {};
    private activeMessages: [Messages | null, Messages | null] = [null, null];
    public focusKey: string | null = null;
    public focusTextArea: HTMLTextAreaElement | null = null;
    private rebuildingDropdowns = false;

    public constructor() {
        this.undoManager.setListener(this.updateUndoRedo.bind(this));
        on(saveAllButton, 'click', this.onSaveAll.bind(this));
        on(loadButton, 'click', this.onLoad.bind(this));
        on(undoButton, 'click', this.onUndo.bind(this));
        on(redoButton, 'click', this.onRedo.bind(this));
        on(newLanguageButton, 'click', this.onNewLanguage.bind(this));
        on(newTranslationButton, 'click', this.onNewMessage.bind(this));
        window.addEventListener('resize', this.updateAllTextAreas.bind(this));
        document.onkeydown = this.onKeyDown.bind(this);
        document.onkeyup = this.onKeyUp.bind(this);
        this.attachDragula();

        on(byId('togglePreview') as HTMLElement, 'click', () => {
            document.body.classList.toggle('show_preview');
            this.updatePreview();
            this.updateAllTextAreas();
        });

        $(languageSelects[0]).chosen({ width: "100%" }).change(() => this.selectLanguage(0, languageSelects[0].value, true));
        $(languageSelects[1]).chosen({ width: "100%" }).change(() => this.selectLanguage(1, languageSelects[1].value, true));
        this.updateUndoRedo();
    }

    private updatePreview() {
        if (document.body.classList.contains('show_preview')) {
            if (!this.focusTextArea)
                previewPane.innerHTML = '<i>Select a field to show the preview</i>';
            else {
                previewPane.innerHTML = md.render(this.focusTextArea.value);
                let links = previewPane.querySelectorAll('a');
                for (let i = 0; i < links.length; i++) {
                    const link = links[i];
                    link.title = link.href;
                    link.href = '#';
                }
            }
        }
    }

    public init(bridge: JavaBridge) {
        this.bridge = bridge;
        let list = bridge.loadMessagesList();
        if (!list.files || list.error) {
            showError('Error loading locales list', list.error);
            return;
        }
        const translationKeys: string[] = [];
        for (let file of list.files) {
            try {
                const messages = loadMessages(file.locale, file.content);

                for (let key of messages.getKeys()) {
                    if (translationKeys.indexOf(key) === -1)
                        translationKeys.push(key);
                }
                this.messagesMap[file.locale] = messages;
            } catch (e) {
                showError('Error reading file', e.message);
                console.error('Error reading file', e);
            }
        }

        this.activeMessages = [null, null];

        // prefer english as first language
        const locales = Object.getOwnPropertyNames(this.messagesMap);
        const firstLocale = this.messagesMap.hasOwnProperty('en') ? 'en' : locales[0];
        if (firstLocale) {
            this.activeMessages[0] = this.messagesMap[firstLocale];
            if (locales.length > 1) {
                const secondLocale = locales.find((locale) => locale !== firstLocale);
                if (secondLocale)
                    this.activeMessages[1] = this.messagesMap[secondLocale];
            }
        }

        this.rebuildDropdowns();

        for (const key of translationKeys) {
            this.createTranslationRow(key);
        }
        this.undoManager.clear();
    }

    private onKeyDown(e: KeyboardEvent) {
        if (e.ctrlKey || e.metaKey) {
            var c = e.which || e.keyCode;
            if (c === Key.Z || c === Key.Y) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (c === Key.Z)
                    this.onUndo();
                else if (c === Key.Y)
                    this.onRedo();
            }
            else if (c === Key.S)
                this.onSaveAll();
        }
    }

    private onKeyUp(e: KeyboardEvent) {
        if (e.ctrlKey || e.metaKey) {
            var c = e.which || e.keyCode;
            if (c === Key.Z || c === Key.Y) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }
    }

    private onUndo(): void {
        if (this.undoManager.canUndo())
            this.undoManager.undo();
    }

    private onRedo(): void {
        if (this.undoManager.canRedo())
            this.undoManager.redo();
    }

    private onSaveAll(): void {
        const rows = entriesTBody.querySelectorAll('tr');
        const translationKeys: string[] = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.dataset.key)
                translationKeys.push(row.dataset.key as string);
            else
                showError('Unexpected error', 'Row without key! This should not have happened');
        }

        let count = 0;
        let list: MessagesFile[] = [];
        for (let locale in this.messagesMap) {
            const language = this.messagesMap[locale];
            list.push({
                locale: language.getLocale(),
                content: saveMessages(language, translationKeys)
            });
            count++;
        }
        const error = this.bridge.saveMessagesList(list);
        if (error) {
            showError('Error saving files', error);
        } else {
            this.undoManager.setUnmodified();
            this.updateUndoRedo();
            showSuccess(count + ' files saved successfully!');
        }
    }

    private onLoad(): void {
        if (this.bridge.openDirectory())
            this.init(this.bridge);
    }

    private onNewLanguage(): void {
        this.promptLocale('en', (locale) => {
            if (locale) {
                const column = this.activeMessages[0] ? 1 : 0;
                const previousMessages = this.activeMessages[column];
                const previousLocale = previousMessages ? previousMessages.getLocale() : null;
                const messages = new Messages(locale);
                this.messagesMap[locale] = messages;
                this.rebuildDropdowns();
                languageSelects[column].value = locale;
                this.selectLanguage(column, locale, false);
                this.undoManager.add(new UndoableLanguageAddRemove(true, messages, column, previousLocale, this));
            }
        });
    }

    private promptLocale(value: string, callback: (locale: string | null) => void) {
        const validationCallback = (locale: string) => {
            if (this.messagesMap[locale])
                return { error: true, message: 'The specified locale already exists' };
            else {
                const result = localeCodeToEnglish(locale);
                if (result.found) {
                    return { error: false, message: result.name };
                } else {
                    return { error: true, message: result.error };
                }
            }
        }
        dialogs.promptValidated("Enter a locale", value, validationCallback, callback);
    }

    private onNewMessage(): void {
        const validationCallback = (key: string) => {
            if(!key)
                return { error: true, message: 'Key can not be empty' };
            if (this.rowMap[key])
                return { error: true, message: 'The specified key already exists' };
            if (key.startsWith('@@'))
                return { error: true, message: 'Keys starting with @@ are reserved!' };
            if (!validName.test(key))
                return { error: true, message: 'Allowed characters: A-Z,a-z,0-9,_ (underscore) or @' };
            return { error: false, message: 'Valid key' };
        }
        dialogs.promptValidated("Please enter the key", "", validationCallback, (key) => {
            if (key) {
                const rowEntry = this.createTranslationRow(key);
                this.undoManager.add(new UndoableMessageAddRemove(true, rowEntry, getDatasetKey(rowEntry.tr.nextSibling as HTMLElement), this));
            }
        });
    }

    private attachDragula() {
        const drake = dragula({
            containers: [byId('entries') as HTMLElement],
            delay: 200,
            moves: (el, container, handle) => !!handle && handle.tagName === 'TD'
        });
        drake.on('cloned', (clone: HTMLElement, original: HTMLElement, type: 'mirror' | 'copy') => {
            const elements = clone.querySelectorAll('textarea, button');
            for (let i = 0; i < elements.length; i++)
                elements[i].remove();
            clone.style.background = 'gray';
        });
        let dragSiblingKey: string | null = null;
        drake.on('drag', (el: HTMLElement, source: HTMLElement) => {
            dragSiblingKey = getDatasetKey(el.nextElementSibling as HTMLElement);
        });
        drake.on('drop', (el: HTMLElement, target: HTMLElement, source: HTMLElement, sibling: HTMLElement) => {
            this.undoManager.add(new UndoableMessageDrag(el.dataset.key as string, dragSiblingKey, getDatasetKey(sibling), this));
        });
    }

    private updateAllTextAreas() {
        for (let key in this.rowMap)
            this.updateTextAreaHeight(this.rowMap[key]);
    }

    public setValue(locale: string, name: string, value: string) {
        const lang = this.messagesMap[locale];
        if (lang)
            lang.set(name, value);
        if (lang === this.activeMessages[0])
            this.rowMap[name].textAreas[0].value = value;
        else if (lang === this.activeMessages[1])
            this.rowMap[name].textAreas[1].value = value;
        this.updateAllTextAreas();
        if (this.focusKey === name)
            this.updatePreview();
    }

    public renameMessage(fromKey: string, toKey: string): void {
        const rowEntry = this.rowMap[fromKey];
        rowEntry.key = toKey;
        rowEntry.label.textContent = toKey;
        rowEntry.tr.setAttribute('data-key', toKey);
        for (let locale in this.messagesMap)
            this.messagesMap[locale].rename(fromKey, toKey);

        delete this.rowMap[fromKey];
        this.rowMap[toKey] = rowEntry;
    }

    public moveMessage(key: string, siblingKey: string | null): void {
        const el = this.rowMap[key].tr;
        entriesTBody.insertBefore(el, siblingKey ? this.rowMap[siblingKey].tr : null);
    }

    public addMessage(rowEntry: RowEntry, siblingKey: string | null): void {
        this.rowMap[rowEntry.key] = rowEntry;
        entriesTBody.insertBefore(rowEntry.tr, siblingKey ? this.rowMap[siblingKey].tr : null);
        this.updateTextAreaHeight(rowEntry);
        //Fixme: add to languages
    }

    public removeMessage(rowEntry: RowEntry, siblingKey: string | null): void {
        delete this.rowMap[rowEntry.key];
        rowEntry.tr.remove();
        //Fixme: remove from languages
    }

    public showRename(rowEntry: RowEntry) {
        const keyValidationCallback = (key: string) => {
            if(!key)
                return { error: true, message: 'Key can not be empty' };
            if (key === rowEntry.key)
                return { error: true, message: 'Enter a new key' };
            if (this.rowMap[key])
                return { error: true, message: 'The specified key already exists' };
            if (key.startsWith('@@'))
                return { error: true, message: 'Keys starting with @@ are reserved!' };
            if (!validName.test(key))
                return { error: true, message: 'Allowed characters: A-Z,a-z,0-9,_ (underscore) or @' };
            return { error: false, message: 'Valid key' };
        }
        dialogs.promptValidated("Rename this message", rowEntry.key, keyValidationCallback, (toKey) => {
            if (toKey) {
                this.undoManager.add(new UndoableMessageRename(rowEntry.key, toKey, this));
                this.renameMessage(rowEntry.key, toKey);
            }
        });
    }

    private createTranslationRow(key: string) {
        const language1 = this.activeMessages[0];
        const language2 = this.activeMessages[1];
        const tr = createElement(entriesTBody, 'tr');
        tr.setAttribute('data-key', key);

        const cell0 = createElement(tr, 'td');
        const button0 = createButton(cell0, '', () => this.showRename(rowEntry));
        button0.className = 'edit';
        attachTooltip(button0, 'Rename message', 'right');

        const label = createElement(tr, 'td', { textContent: key });

        const cell1b = createElement(tr, 'td');
        const button1b = createButton(cell1b, '', () => showError('Not implemented yet', 'Placeholders can not be configured yet'));
        button1b.className = 'placeholders';
        attachTooltip(button1b, 'Configure placeholders', 'right');

        const cell1 = createElement(tr, 'td');
        const textArea1 = createElement(cell1, 'textarea', { value: language1 ? language1.get(key).message : '' }) as HTMLTextAreaElement;

        const cell2 = createElement(tr, 'td');
        const textArea2 = createElement(cell2, 'textarea', { value: language2 ? language2.get(key).message : '' }) as HTMLTextAreaElement;
        const cell3 = createElement(tr, 'td');
        const button = createButton(cell3, '', () => {
            this.undoManager.add(new UndoableMessageAddRemove(false, rowEntry, getDatasetKey(tr.nextSibling as HTMLElement), this));
            rowEntry.tr.remove();
        });
        button.className = 'delete';
        attachTooltip(button, 'Delete message', 'left');

        const rowEntry: RowEntry = {
            key,
            tr,
            label,
            textAreas: [textArea1, textArea2]
        }

        on(textArea1, 'input', () => this.onTextAreaInput(rowEntry, 0));
        on(textArea2, 'input', () => this.onTextAreaInput(rowEntry, 1));
        on(textArea1, 'focus', () => this.setFocus(key, textArea1));
        on(textArea2, 'focus', () => this.setFocus(key, textArea2));
        this.updateTextAreaHeight(rowEntry);
        this.rowMap[key] = rowEntry;
        return rowEntry;
    }

    private setFocus(key: string, textArea: HTMLTextAreaElement) {
        this.focusKey = key;
        this.focusTextArea = textArea;
        this.updatePreview();
    }

    private onTextAreaInput(rowEntry: RowEntry, column: 0 | 1) {
        this.handleUndoableInput(rowEntry, column);
        this.updateTextAreaHeight(rowEntry);
        this.updatePreview();
    }

    private updateTextAreaHeight(rowEntry: RowEntry) {
        const scrollTop = mainElement.scrollTop;
        const scrollLeft = mainElement.scrollLeft;
        const ta1 = rowEntry.textAreas[0];
        const ta2 = rowEntry.textAreas[1];
        ta1.style.height = "5px";
        ta2.style.height = "5px";
        ta1.style.height = ta2.style.height = (Math.max(ta1.scrollHeight, ta2.scrollHeight) + 1) + "px";
        mainElement.scrollTop = scrollTop;
        mainElement.scrollLeft = scrollLeft;
    }

    private handleUndoableInput(rowEntry: RowEntry, column: 0 | 1) {
        const language = this.activeMessages[column];
        if (language) {
            const newValue = rowEntry.textAreas[column].value;
            this.undoManager.add(new UndoableMessageChange(language.getLocale(), rowEntry.key, language.get(rowEntry.key).message, newValue, this));
            language.set(rowEntry.key, newValue);
        }
    }

    private updateUndoRedo() {
        undoButton.disabled = !this.undoManager.canUndo();
        redoButton.disabled = !this.undoManager.canRedo();
        saveAllButton.disabled = !this.undoManager.isModified();
        this.bridge.setDirty(this.undoManager.isModified());
    }

    public addLanguage(messages: Messages, column: 0 | 1): void {
        const locale = messages.getLocale();
        this.messagesMap[locale] = messages;
        this.rebuildDropdowns();
        languageSelects[column].value = locale;
        this.selectLanguage(column, locale, false);
    }

    public removeLanguage(messages: Messages, column: 0 | 1, previousLocale: string | null): void {
        const locale = messages.getLocale();
        delete this.messagesMap[locale];
        languageSelects[column].value = previousLocale || '';
        this.activeMessages[column] = previousLocale ? this.messagesMap[previousLocale] : null;
        this.rebuildDropdowns();
    }

    public changeLanguage(column: 0 | 1, locale: string | null): void {
        languageSelects[column].value = locale || '';
        this.selectLanguage(column, locale, false);
    }

    private selectLanguage(column: 0 | 1, locale: string | null, addUndo: boolean) {
        if (!this.rebuildingDropdowns) {
            const previousMessages = this.activeMessages[column];
            const previousLocale = previousMessages ? previousMessages.getLocale() : null;
            const messages = locale ? this.messagesMap[locale] : null;
            this.activeMessages[column] = messages;
            for (const key in this.rowMap) {
                const rowEntry = this.rowMap[key];
                rowEntry.textAreas[column].value = messages ? messages.get(key).message : '';
            }
            this.updateDisabledDropdownOptions();
            this.updateChosenDropdowns();
            this.updateAllTextAreas();
            if (addUndo)
                this.undoManager.add(new UndoableLanguageChange(column, previousLocale, locale, this));
        }
    }

    private updateDisabledDropdownOptions() {
        this.updateDisabledDropdownOption(languageSelects[0], languageSelects[1].value);
        this.updateDisabledDropdownOption(languageSelects[1], languageSelects[0].value);
    }

    private updateDisabledDropdownOption(select: HTMLSelectElement, disabledValue: string) {
        for (let i = 0; i < select.children.length; i++) {
            let option = select.children[i] as HTMLOptionElement;
            option.disabled = !!disabledValue && option.value === disabledValue;
        }
    }

    private updateChosenDropdowns() {
        $(languageSelects[0]).trigger("chosen:updated");
        $(languageSelects[1]).trigger("chosen:updated");
    }

    private rebuildDropdowns() {
        this.rebuildingDropdowns = true;
        removeAllChildren(languageSelects[0]);
        removeAllChildren(languageSelects[1]);
        const locales = Object.getOwnPropertyNames(this.messagesMap).sort();
        createElement(languageSelects[0], 'option', { value: '', textContent: '----' });
        createElement(languageSelects[1], 'option', { value: '', textContent: '----' });
        for (let locale of locales) {
            const language = this.messagesMap[locale];
            const label = language.getName() + ' [' + locale + ']';
            createElement(languageSelects[0], 'option', { value: locale, textContent: label });
            createElement(languageSelects[1], 'option', { value: locale, textContent: label });
        }
        const language1 = this.activeMessages[0];
        if (language1)
            languageSelects[0].value = language1.getLocale();
        const language2 = this.activeMessages[1];
        if (language2)
            languageSelects[1].value = language2.getLocale();
        this.rebuildingDropdowns = false;
        this.updateDisabledDropdownOptions();
        this.updateChosenDropdowns();
    }
}

(window as any).translator = new Translator();
