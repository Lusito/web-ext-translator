import { createAction } from "deox";

export const setWebExtensionActive = createAction("WEB_EXTENSION/SET_ACTIVE", (resolve) => (active: boolean) =>
    resolve({ active })
);
