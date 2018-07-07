/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
import "./style.css";
import { State, LoadedExtension } from "../../../shared";
import { Dispatch, connect } from "react-redux";
import { WetAction } from "../../../actions";
import { TranslationTableRow } from "../TranslationTableRow";

interface TranslationTableBodyProps {
    extension: LoadedExtension;
}

type TranslationTableBodyDispatchProps = {};

type TranslationTableBodyMergedProps = TranslationTableBodyProps & TranslationTableBodyDispatchProps;

function TranslationTableBody({ extension }: TranslationTableBodyMergedProps) {
    const firstLanguage = extension.firstLocale ? extension.languages[extension.firstLocale] : null;
    const secondLanguage = extension.secondLocale ? extension.languages[extension.secondLocale] : null;
    const rows = extension.mainLanguage.messages.map((message) => {
        if (message.group) {
            return <tr className="translation-table-body__section">
                <th colSpan={3} className="translation-table-body__th">{message.message}</th>
            </tr>;
        }
        return <TranslationTableRow key={message.name} message={message} firstLanguage={firstLanguage} secondLanguage={secondLanguage} />;
    });
    return <div className="translation-table-body">
        <table className="translation-table-body__table">
            <tbody>{rows}</tbody>
        </table>
    </div>;
}

function mapStateToProps({ }: State) {
    return {};
}

function mapDispatchToProps(dispatch: Dispatch<WetAction>) {
    return {};
}

function mergeProps(stateProps: {}, dispatchProps: TranslationTableBodyDispatchProps, ownProps: TranslationTableBodyProps): TranslationTableBodyMergedProps {
    return {
        ...ownProps,
        ...dispatchProps
    };
}
export default connect<{}, TranslationTableBodyDispatchProps, TranslationTableBodyProps, TranslationTableBodyMergedProps, State>(mapStateToProps, mapDispatchToProps, mergeProps)(TranslationTableBody);
