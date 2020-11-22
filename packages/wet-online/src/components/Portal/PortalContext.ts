import React, { useContext, useEffect, useState } from "react";

const portalIds = new Set<string>();

const listeners = new Set<() => void>();

export const PortalContext = React.createContext({
    register(id: string) {
        portalIds.add(id);
        listeners.forEach((update) => update());
    },
    unregister(id: string) {
        portalIds.delete(id);
        listeners.forEach((update) => update());
    },
    exists(id: string) {
        return portalIds.has(id);
    },
});

export const usePortalGoal = (id: string) => {
    const context = useContext(PortalContext);
    useEffect(() => {
        context.register(id);
        return () => context.unregister(id);
    }, [id]);
};

export const usePortal = (id: string) => {
    const context = useContext(PortalContext);
    const [, setValue] = useState(0);
    useEffect(() => {
        const listener = () => setValue(Date.now());
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);
    return context.exists(id);
};
