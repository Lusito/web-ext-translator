import React, { useEffect, useState } from "react";
import { useDispatch } from "@react-nano/redux";

import { getParameter } from "../../utils/getParameter";
import { importVcs } from "../../vcs/importVcs";
import AlertDialog from "../Dialogs/AlertDialog";
import { setLoading, loadExtension, LoadExtensionData } from "../../redux/extension";
import { useSetDirty } from "../../hooks";

export default () => {
    const setDirty = useSetDirty();
    const [alertMessage, setAlertMessage] = useState("");
    const dispatch = useDispatch();
    const setLoadingMessage = (message: string) => dispatch(setLoading(message));
    const onSuccess = (data: LoadExtensionData) => {
        dispatch(loadExtension(data));
        setDirty(false);
    };

    useEffect(() => {
        const gh = getParameter("gh");
        gh && importVcs(gh, setLoadingMessage, onSuccess, setAlertMessage);
    }, []);

    return !alertMessage ? null : (
        <AlertDialog title="Something went wrong!" message={alertMessage} onClose={() => setAlertMessage("")} />
    );
};
