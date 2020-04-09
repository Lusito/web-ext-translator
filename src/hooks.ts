import { useState, useMemo } from "react";

import { useAppBridge } from "./AppBridge";

function onBeforeUnload() {
    return "There are unsaved changes. Discard all changes?";
}

export const useOpen = (initialValue = false) => {
    const [value, setValue] = useState(initialValue);
    const setOpen = () => setValue(true);
    const setClosed = () => setValue(false);
    return [value, setOpen, setClosed] as const;
};

export const useSetDirty = () => {
    const appBridge = useAppBridge();
    return useMemo(() => {
        if (appBridge) return (dirty: boolean) => appBridge.setDirty(dirty);
        return (dirty: boolean) => {
            window.onbeforeunload = dirty ? onBeforeUnload : null;
        };
    }, [appBridge]);
};
