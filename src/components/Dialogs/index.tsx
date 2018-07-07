import * as React from "react";
import "./style.css";
import { WetAction } from "../../actions";
import { Dispatch, connect } from "react-redux";
import { State } from "../../shared";

interface DialogsProps {
    dialogs: JSX.Element[];
}

function Dialogs({ dialogs }: DialogsProps) {
    if (dialogs.length === 0)
        return null;
    return <div className="dialog-overlay">
        {dialogs.map((d, i) => <div key={i} className="dialog-wrapper">{d}</div>)}
    </div>;
}

function mapStateToProps({ dialogs }: State) {
    return {
        dialogs
    };
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {};
}
export default connect<DialogsProps>(mapStateToProps, mapDispatchToProps)(Dialogs);

let nextDialogIndex = 1;
export function getNewDialogIndex() {
    return nextDialogIndex++;
}
