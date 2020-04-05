/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import { useSelector } from "react-redux-nano";

import { selectDialogs } from "../../selectors";
import "./style.css";

export default () => {
    const dialogs = useSelector(selectDialogs);
    return dialogs.length === 0 ? null : (
        <div className="dialog-overlay">
            {dialogs.map((d, i) => (
                <div key={i} className="dialog-wrapper">
                    {d}
                </div>
            ))}
        </div>
    );
};

let nextDialogIndex = 1;
export function getNewDialogIndex() {
    return nextDialogIndex++;
}
