import { useDispatch } from "react-redux-nano";
import React, { useEffect, useState } from "react";

import { useAppBridge } from "../../AppBridge";
import { loadFiles } from "../../utils/loader";
import AlertDialog from "../Dialogs/AlertDialog";
import { loadExtension } from "../../redux/extension";
import { useSetDirty } from "../../hooks";

export default () => {
    const dispatch = useDispatch();
    const appBridge = useAppBridge();
    const setDirty = useSetDirty();
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        if (appBridge) {
            const result = appBridge.loadFiles();
            if (typeof result === "string") {
                setAlertMessage(result);
            } else {
                try {
                    dispatch(loadExtension(loadFiles(result)));
                    setDirty(false);
                } catch (e) {
                    console.error("error loading files: ", e);
                    setAlertMessage(`Failed to load folder. Reason: ${e.message}`);
                }
            }
        }
    }, [appBridge]);

    return !alertMessage ? null : (
        <AlertDialog title="Something went wrong!" message={alertMessage} onClose={() => setAlertMessage("")} />
    );
};
