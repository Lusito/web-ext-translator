import ReactDOM from "react-dom";
import React from "react";

import { usePortal } from "./PortalContext";

interface PortalProps {
    goal: string;
}

export default function ({ children, goal }: React.PropsWithChildren<PortalProps>) {
    const active = usePortal(goal);
    return active ? ReactDOM.createPortal(children, document.querySelector(`[data-portal-id="${goal}"]`)) : null;
}
