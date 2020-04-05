import React from "react";
import "./style.css";

export interface LoadingScreenProps {
    label: string;
}

export default ({ label }: LoadingScreenProps) => (
    <div className="LoadingScreen">
        <div className="LoadingScreen__center">
            <i className="fa fa-spinner fa-pulse fa-4x fa-fw" />
            <span className="LoadingScreen__label">{label}</span>
        </div>
    </div>
);
