import { useDispatch } from "react-redux-nano";

import { createAlertDialog } from "./components/Dialogs/AlertDialog";
import { WetActionLoadPayload } from "./redux/actions/load";

export const useSetLoading = () => {
    const dispatch = useDispatch();
    return (message: string) =>
        dispatch({
            type: "SET_LOADING",
            payload: message,
        });
};

export const useOnErrror = () => {
    const dispatch = useDispatch();
    return (message: string) =>
        dispatch({
            type: "SHOW_DIALOG",
            payload: createAlertDialog("Something went wrong!", message),
        });
};

export const useLoad = () => {
    const dispatch = useDispatch();
    return (data: WetActionLoadPayload) => dispatch({ type: "LOAD", payload: data });
};

export const useCloseDialog = () => {
    const dispatch = useDispatch();
    return (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key });
};
