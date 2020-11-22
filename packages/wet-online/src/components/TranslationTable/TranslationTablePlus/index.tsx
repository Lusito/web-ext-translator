import React from "react";

import AddMessageDialog from "../../Dialogs/AddMessageDialog";
import { useOpen } from "../../../hooks";
import "./style.css";

interface TranslationTablePlusProps {
    messageName: string;
}

export default ({ messageName }: TranslationTablePlusProps) => {
    const [open, setOpen, setClosed] = useOpen(false);
    return (
        <>
            <button onClick={setOpen} className="translation-table-plus">
                +
            </button>
            {open && <AddMessageDialog messageName={messageName} onClose={setClosed} />}
        </>
    );
};
