import React from "react";

import { usePortalGoal } from "./PortalContext";

interface PortalGoalProps {
    id: string;
    className?: string;
}

export default function PortalGoal({ id, className, children }: React.PropsWithChildren<PortalGoalProps>) {
    usePortalGoal(id);

    return (
        <div className={className} data-portal-id={id}>
            {children}
        </div>
    );
}
