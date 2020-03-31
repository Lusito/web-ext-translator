/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";

import store from "../../../store";
import { createAddMessageDialog } from "../../Dialogs/AddMessageDialog";

interface TranslationTablePlusProps {
    messageName: string;
}

export function TranslationTablePlus({ messageName }: TranslationTablePlusProps) {
    function onClick() {
        store.dispatch({ type: "SHOW_DIALOG", payload: createAddMessageDialog(messageName) });
    }
    return <button onClick={onClick}>+</button>;
}
