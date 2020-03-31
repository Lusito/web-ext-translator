/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import React from "react";
import "./style.css";

export interface IconButtonProps {
    icon: string;
    tooltip: string;
    className?: string;
    onClick?: () => void;
}

export function IconButton({ icon, tooltip, className, onClick }: IconButtonProps) {
    return (
        <div data-tooltip={tooltip} className={`icon-button ${className}`} onClick={onClick}>
            <i className={`fa fa-fw fa-2x fa-${icon}`} />
        </div>
    );
}
