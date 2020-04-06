import { useState } from "react";

export const useOpen = (initialValue = false) => {
    const [value, setValue] = useState(initialValue);
    const setOpen = () => setValue(true);
    const setClosed = () => setValue(false);
    return [value, setOpen, setClosed] as const;
};
