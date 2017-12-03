export abstract class UndoableEdit {
    public abstract undo(): void;
    public abstract redo(): void;

    public merge(edit: UndoableEdit): boolean {
        return false;
    }

    public replace(edit: UndoableEdit): boolean {
        return false;
    }

    public isSignificant(): boolean {
        return true;
    }
}

export class UndoManager {
    private edits: UndoableEdit[] = [];
    private position = 0;
    private unmodifiedPosition = 0;
    private limit: number;
    private listener: null | (() => void) = null;

    public constructor(limit = 100) {
        this.limit = limit;
    }

    public setListener(listener: () => void) {
        this.listener = listener;
    }

    public isModified() {
        if (this.position === this.unmodifiedPosition)
            return false;
        if (this.edits.length <= this.unmodifiedPosition)
            return true;
        let from = this.testUndo(this.unmodifiedPosition);
        from = from === false ? this.unmodifiedPosition : (from + 1);
        let to = this.testRedo(this.unmodifiedPosition);
        to = to === false ? (this.unmodifiedPosition + 1) : (to - 1);
        return this.position < from || this.position > to;
    }

    public setUnmodified() {
        this.unmodifiedPosition = this.position;
    }

    public getLimit(): number {
        return this.limit;
    }

    public clear(): void {
        this.edits.length = 0;
        this.position = 0;
        if (this.listener)
            this.listener();
    }

    private applyLimit(limit: number) {
        let diff = this.edits.length - limit
        if (diff > 0)
            this.edits.splice(0, diff);
    }

    public setLimit(value: number): void {
        this.applyLimit(this.limit = value);
    }

    private testUndo(position: number): number | false {
        for (let i = position - 1; i >= 0; i--) {
            if (this.edits[i].isSignificant())
                return i;
        }
        return false;
    }

    public canUndo(): boolean {
        return this.testUndo(this.position) !== false;
    }

    public undo(): void {
        let newPosition = this.testUndo(this.position);
        if (newPosition === false)
            throw new Error('Cannot undo');
        while (this.position > newPosition) {
            let next = this.edits[--this.position];
            next.undo();
        }
        if (this.listener)
            this.listener();
    }

    private testRedo(position: number): number | false {
        for (let i = position; i < this.edits.length; i++) {
            if (this.edits[i].isSignificant())
                return i + 1;
        }
        return false;
    }

    public canRedo(): boolean {
        return this.testRedo(this.position) !== false;
    }

    public redo(): void {
        let newPosition = this.testRedo(this.position);
        if (newPosition === false)
            throw new Error('Cannot redo');
        while (this.position < newPosition) {
            let next = this.edits[this.position++];
            next.redo();
        }
        if (this.listener)
            this.listener();
    }

    public add(edit: UndoableEdit) {
        if (this.edits.length > this.position)
            this.edits.length = this.position;

        if (this.edits.length === 0 || this.unmodifiedPosition === this.edits.length)
            this.edits.push(edit);
        else {
            let last = this.edits[this.edits.length - 1];

            if (!last.merge(edit)) {
                if (edit.replace(last))
                    this.edits.pop();
                this.edits.push(edit);
            }
        }

        this.applyLimit(this.limit);
        this.position = this.edits.length;
        if (this.listener)
            this.listener();
    }
}
