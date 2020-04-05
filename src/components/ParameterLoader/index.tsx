import { useEffect } from "react";

import { getParameter } from "../../utils/getParameter";
import { github } from "../../vcs";

export default (): null => {
    useEffect(() => {
        const gh = getParameter("gh");
        gh && github.import(gh);
    }, []);

    return null;
};
