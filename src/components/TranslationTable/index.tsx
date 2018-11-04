/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
import TranslationTableHead from "./TranslationTableHead";
import TranslationTableBody from "./TranslationTableBody";
import { LoadedExtension } from "../../shared";

interface TranslationTableProps {
    extension: LoadedExtension;
    showPlus: boolean;
}

export function TranslationTable({ extension, showPlus }: TranslationTableProps) {
    return <React.Fragment>
        <TranslationTableHead extension={extension} />
        <TranslationTableBody extension={extension} showPlus={showPlus} />
    </React.Fragment>;
}
