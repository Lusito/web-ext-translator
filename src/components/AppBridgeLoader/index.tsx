import { useDispatch, useSelector } from "react-redux-nano";
import { useEffect } from "react";

import { selectAppBridge } from "../../redux/selectors";
import { createAlertDialog } from "../Dialogs/AlertDialog";
import { loadFiles } from "../../utils/loader";

export default (): null => {
    const dispatch = useDispatch();
    const bridge = useSelector(selectAppBridge);
    useEffect(() => {
        if (bridge) {
            const result = bridge.loadFiles();
            if (typeof result === "string") {
                dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Something went wrong!", result) });
            } else {
                try {
                    dispatch({ type: "LOAD", payload: loadFiles(result) });
                } catch (e) {
                    console.error("error loading files: ", e);
                    dispatch({
                        type: "SHOW_DIALOG",
                        payload: createAlertDialog(
                            "Something went wrong!",
                            `Failed to load folder. Reason: ${e.message}`
                        ),
                    });
                }
            }
        }
    }, [bridge]);
    return null;
};
