import React, { PropsWithChildren } from "react";

import Portal from "../../Portal";
import "./style.css";

export default ({ children }: PropsWithChildren<{}>) => (
    <Portal goal="overlays">
        <div className="dialog-overlay">
            <div className="dialog-wrapper">{children}</div>
        </div>
    </Portal>
);
