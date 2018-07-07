import DelayedExecution from "../lib/DelayedExecution";

let adjustAllRows = false;
const rowsToUpdate: Element[] = [];

const delayedAdjustHeights = new DelayedExecution(() => {
    if (adjustAllRows) {
        adjustAllRows = false;
        rowsToUpdate.length = 0;
        adjustHeightsFor.apply(null, document.querySelectorAll(".translation-table-body__row"));
    } else {
        const container = document.querySelector(".translation-table-body");
        if (container) {
            const scrollTop = container.scrollTop;
            const scrollLeft = container.scrollLeft;
            for (const row of rowsToUpdate) {
                const textAreas = row.querySelectorAll("textarea");
                const ta1 = textAreas[0];
                const ta2 = textAreas[1];
                ta1.style.height = "5px";
                ta2.style.height = "5px";
                ta1.style.height = ta2.style.height = (Math.max(ta1.scrollHeight, ta2.scrollHeight) + 20) + "px";
            }
            rowsToUpdate.length = 0;
            container.scrollTop = scrollTop;
            container.scrollLeft = scrollLeft;
        }
    }
});

export function adjustHeightsFor(...rows: Element[]) {
    rows.forEach((row) => rowsToUpdate.indexOf(row) === -1 && rowsToUpdate.push(row));
    delayedAdjustHeights.restart(10);
}

export function adjustAllHeights() {
    adjustAllRows = true;
    delayedAdjustHeights.restart(10);
}
