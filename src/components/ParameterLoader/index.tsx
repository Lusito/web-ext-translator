import { useEffect } from "react";

import { getParameter } from "../../utils/getParameter";
import { importVcs } from "../../vcs/importVcs";
import { useSetLoading, useOnErrror, useLoad } from "../../hooks";

export default (): null => {
    const setLoading = useSetLoading();
    const onError = useOnErrror();
    const onSuccess = useLoad();

    useEffect(() => {
        const gh = getParameter("gh");
        gh && importVcs(gh, setLoading, onSuccess, onError);
    }, []);

    return null;
};
