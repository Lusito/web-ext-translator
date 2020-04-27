import ReactDOM from "react-dom";
import React from "react";

import { usePortal } from "./PortalContext";

interface PortalProps {
    goal: string;
}

export default function ({ children, goal }: React.PropsWithChildren<PortalProps>) {
    const active = usePortal(goal);
    const portal = document.querySelector(`[data-portal-id="${goal}"]`);
    if (!portal) throw new Error(`Portal with id "${goal}" does not exist in dom tree!`);
    return active ? ReactDOM.createPortal(children, portal) : null;
}
