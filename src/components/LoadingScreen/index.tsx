/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import * as React from "react";
import "./style.css";

export interface LoadingScreenProps {
    label: string;
}

export function LoadingScreen({ label }: LoadingScreenProps) {
    return <div className="LoadingScreen">
        <div className="LoadingScreen__center">
            <i className="fa fa-spinner fa-pulse fa-4x fa-fw"></i>
            <span className="LoadingScreen__label">{label}</span>
        </div>
    </div>;
}
