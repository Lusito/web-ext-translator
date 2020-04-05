import { useEffect } from "react";
import { useDispatch } from "react-redux-nano";

export default (): null => {
    const dispatch = useDispatch();
    useEffect(() => {
        const listener = (event: MessageEvent) => {
            if (event.source === window && event.data && event.data.action === "EnableWebExtensionMode")
                dispatch({ type: "ENABLE_WEB_EXTENSION_MODE" });
        };
        window.addEventListener("message", listener);
        return () => window.removeEventListener("message", listener);
    });
    return null;
};
