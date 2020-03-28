/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import "./style.css";
import { connect } from "react-redux";
import { State } from "../../shared";

interface DialogsStateProps {
    dialogs: JSX.Element[];
}

function Dialogs({ dialogs }: DialogsStateProps) {
    if (dialogs.length === 0)
        return null;
    return <div className="dialog-overlay">
        {dialogs.map((d, i) => <div key={i} className="dialog-wrapper">{d}</div>)}
    </div>;
}

function mapStateToProps({ dialogs }: State) {
    return { dialogs };
}

export default connect<DialogsStateProps>(mapStateToProps)(Dialogs);

let nextDialogIndex = 1;
export function getNewDialogIndex() {
    return nextDialogIndex++;
}
