import { useEffect } from "react";
import { useDispatch } from "react-redux-nano";

import { setWebExtensionActive } from "../../redux/webExtension";

export default (): null => {
    const dispatch = useDispatch();
    useEffect(() => {
        const listener = (event: MessageEvent) => {
            if (event.source === window && event.data && event.data.action === "EnableWebExtensionMode")
                dispatch(setWebExtensionActive(true));
        };
        window.addEventListener("message", listener);
        return () => window.removeEventListener("message", listener);
    });
    return null;
};
