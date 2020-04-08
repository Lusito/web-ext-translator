import { actionCreator } from "tsrux";

export const setPreview = actionCreator("PREVIEW/SET", (markdown: string, rtl: boolean) =>
    ({ markdown, rtl })
);
export const togglePreview = actionCreator("PREVIEW/TOGGLE");
