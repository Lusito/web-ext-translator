import { UndoableEdit } from 'typed-undo';
import { Messages } from "../Messages";

export interface RowEntry {
    key: string,
    tr: HTMLElement,
    label: HTMLElement,
    textAreas: [HTMLTextAreaElement, HTMLTextAreaElement]
}

export interface UndoableMessageChangeListener {
    setValue(locale: string, name: string, value: string): void;
}

export class UndoableMessageChange extends UndoableEdit {
    private readonly locale: string;
    private readonly name: string;
    private readonly oldValue: string;
    private newValue: string;
    private readonly listener: UndoableMessageChangeListener;

    public constructor(locale: string, name: string, oldValue: string, newValue: string, listener: UndoableMessageChangeListener) {
        super();
        this.locale = locale;
        this.name = name;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.listener = listener;
    }

    public undo(): void {
        this.listener.setValue(this.locale, this.name, this.oldValue);
    }

    public redo(): void {
        this.listener.setValue(this.locale, this.name, this.newValue);
    }

    public isSignificant(): boolean {
        return this.oldValue !== this.newValue;
    }

    public merge(edit: UndoableEdit): boolean {
        if (edit instanceof UndoableMessageChange && edit.locale === this.locale && edit.name === this.name) {
            this.newValue = edit.newValue;
            return true;
        }
        return false;
    }
}

export interface UndoableMessageAddRemoveListener {
    addMessage(rowEntry: RowEntry, siblingKey: string | null): void;
    removeMessage(rowEntry: RowEntry, siblingKey: string | null): void;
}

export class UndoableMessageAddRemove extends UndoableEdit {
    private readonly add: boolean;
    private readonly rowEntry: RowEntry;
    private readonly siblingKey: string | null;
    private readonly listener: UndoableMessageAddRemoveListener;

    public constructor(add: boolean, rowEntry: RowEntry, siblingKey: string | null, listener: UndoableMessageAddRemoveListener) {
        super();
        this.add = add;
        this.rowEntry = rowEntry;
        this.siblingKey = siblingKey;
        this.listener = listener;
    }

    protected performAddRemove(add: boolean) {
        if (add) {
            this.listener.addMessage(this.rowEntry, this.siblingKey);
        } else {
            this.listener.removeMessage(this.rowEntry, this.siblingKey);
        }
    }

    public undo(): void {
        this.performAddRemove(!this.add);
    }

    public redo(): void {
        this.performAddRemove(this.add);
    }
}

export interface UndoableMessageDragListener {
    moveMessage(key: string, siblingKey: string | null): void;
}

export class UndoableMessageDrag extends UndoableEdit {
    private readonly key: string;
    private readonly fromSiblingKey: string | null;
    private toSiblingKey: string | null;
    private readonly listener: UndoableMessageDragListener;

    public constructor(key: string, fromSiblingKey: string | null, toSiblingKey: string | null, listener: UndoableMessageDragListener) {
        super();
        this.key = key;
        this.fromSiblingKey = fromSiblingKey;
        this.toSiblingKey = toSiblingKey;
        this.listener = listener;
    }

    public undo(): void {
        this.listener.moveMessage(this.key, this.fromSiblingKey);
    }

    public redo(): void {
        this.listener.moveMessage(this.key, this.toSiblingKey);
    }

    public isSignificant(): boolean {
        return this.fromSiblingKey !== this.toSiblingKey;
    }

    public merge(edit: UndoableEdit): boolean {
        if (edit instanceof UndoableMessageDrag && edit.key === this.key) {
            this.toSiblingKey = edit.toSiblingKey;
            return true;
        }
        return false;
    }
}

export interface UndoableMessageRenameListener {
    renameMessage(fromKey: string, toKey: string): void;
}

export class UndoableMessageRename extends UndoableEdit {
    private readonly fromKey: string;
    private toKey: string;
    private readonly listener: UndoableMessageRenameListener;

    public constructor(fromKey: string, toKey: string, listener: UndoableMessageRenameListener) {
        super();
        this.fromKey = fromKey;
        this.toKey = toKey;
        this.listener = listener;
    }

    public undo(): void {
        this.listener.renameMessage(this.toKey, this.fromKey);
    }

    public redo(): void {
        this.listener.renameMessage(this.fromKey, this.toKey);
    }

    public isSignificant(): boolean {
        return this.fromKey !== this.toKey;
    }

    public merge(edit: UndoableEdit): boolean {
        if (edit instanceof UndoableMessageRename) {
            this.toKey = edit.toKey;
            return true;
        }
        return false;
    }
}


export interface UndoableLanguageChangeListener {
    changeLanguage(column: 0 | 1, locale: string | null): void;
}

export class UndoableLanguageChange extends UndoableEdit {
    private readonly column: 0 | 1;
    private readonly fromLocale: string | null;
    private toLocale: string | null;
    private readonly listener: UndoableLanguageChangeListener;

    public constructor(column: 0 | 1, fromLocale: string | null, toLocale: string | null, listener: UndoableLanguageChangeListener) {
        super();
        this.column = column;
        this.fromLocale = fromLocale;
        this.toLocale = toLocale;
        this.listener = listener;
    }

    public undo(): void {
        this.listener.changeLanguage(this.column, this.fromLocale);
    }

    public redo(): void {
        this.listener.changeLanguage(this.column, this.toLocale);
    }

    public isSignificant(): boolean {
        return false;
    }

    public merge(edit: UndoableEdit): boolean {
        if (edit instanceof UndoableLanguageChange && edit.column === this.column) {
            this.toLocale = edit.toLocale;
            return true;
        }
        return false;
    }
}

export interface UndoableLanguageAddRemoveListener {
    addLanguage(messages: Messages, column: 0 | 1): void;
    removeLanguage(messages: Messages, column: 0 | 1, previousLocale: string | null): void;
}

export class UndoableLanguageAddRemove extends UndoableEdit {
    private readonly add: boolean;
    private readonly messages: Messages;
    private readonly column: 0 | 1;
    private readonly previousLocale: string | null;
    private readonly listener: UndoableLanguageAddRemoveListener;

    public constructor(add: boolean, messages: Messages, column: 0 | 1, previousLocale: string | null, listener: UndoableLanguageAddRemoveListener) {
        super();
        this.add = add;
        this.messages = messages;
        this.column = column;
        this.previousLocale = previousLocale;
        this.listener = listener;
    }

    protected performAddRemove(add: boolean) {
        if (add) {
            this.listener.addLanguage(this.messages, this.column);
        } else {
            this.listener.removeLanguage(this.messages, this.column, this.previousLocale);
        }
    }

    public undo(): void {
        this.performAddRemove(!this.add);
    }

    public redo(): void {
        this.performAddRemove(this.add);
    }
}
