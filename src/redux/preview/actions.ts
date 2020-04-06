import { createAction } from "deox";

export const setPreview = createAction("PREVIEW/SET", (resolve) => (markdown: string, rtl: boolean) =>
    resolve({ markdown, rtl })
);
export const togglePreview = createAction("PREVIEW/TOGGLE");
