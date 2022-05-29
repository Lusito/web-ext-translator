import React, { PropsWithChildren } from "react";

import DialogOverlay from "../DialogOverlay";
import "./style.css";

interface DialogButton {
    label: string;
    onClick: () => void;
    focus?: boolean;
}

interface DialogProps {
    title: string;
    className: string;
    buttons: DialogButton[];
}

export default ({ title, className, buttons, children }: PropsWithChildren<DialogProps>) => (
    <DialogOverlay>
        <div className={`dialog ${className}`}>
            <h2 className={`dialog__title ${className}__title`}>{title}</h2>
            <div className={`dialog__content ${className}__content`}>{children}</div>
            <div className={`dialog__buttons ${className}__buttons`}>
                {buttons.map((b) => (
                    <button
                        key={b.label}
                        onClick={b.onClick}
                        autoFocus={b.focus}
                        className={`dialog__button ${className}__button`}
                    >
                        {b.label}
                    </button>
                ))}
            </div>
        </div>
    </DialogOverlay>
);
