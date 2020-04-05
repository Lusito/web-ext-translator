/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import { useDispatch } from "react-redux-nano";

import { createAddMessageDialog } from "../../Dialogs/AddMessageDialog";

interface TranslationTablePlusProps {
    messageName: string;
}

export default ({ messageName }: TranslationTablePlusProps) => {
    const dispatch = useDispatch();
    const onClick = () => dispatch({ type: "SHOW_DIALOG", payload: createAddMessageDialog(messageName) });
    return <button onClick={onClick}>+</button>;
};
