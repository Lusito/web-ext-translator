import React from "react";
import "./style.css";

export interface IconButtonProps {
    icon: string;
    tooltip: string;
    className?: string;
    onClick?: () => void;
}

export default ({ icon, tooltip, className, onClick }: IconButtonProps) => (
    <div data-tooltip={tooltip} className={`icon-button ${className}`} onClick={onClick}>
        <i className={`fa fa-fw fa-2x fa-${icon}`} />
    </div>
);
