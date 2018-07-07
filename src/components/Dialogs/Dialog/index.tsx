/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
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

export default function Dialog({ title, className, buttons, children }: DialogProps & JSX.ElementChildrenAttribute) {
    return <div className={`dialog ${className}`}>
        <h2 className={`dialog__title ${className}__title`}>{title}</h2>
        <div className={`dialog__content ${className}__content`}>{children}</div>
        <div className={`dialog__buttons ${className}__buttons`}>
            {buttons.map((b) => <button key={b.label} onClick={b.onClick} ref={b.focus ? (e) => e && e.focus() : undefined}  className={`dialog__button ${className}__button`}>{b.label}</button>)}
        </div>
    </div>;
}
