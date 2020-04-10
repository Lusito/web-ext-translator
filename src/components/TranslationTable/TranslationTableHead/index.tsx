import React from "react";

import LanguageSelect from "../../LanguageSelect";
import "./style.css";

export default () => (
    <div className="translation-table-head">
        <div className="translation-table-head__cell">Key</div>
        <div className="translation-table-head__cell">
            <LanguageSelect first tabIndex={1} />
        </div>
        <div className="translation-table-head__cell">
            <LanguageSelect first={false} tabIndex={2} />
        </div>
    </div>
);
