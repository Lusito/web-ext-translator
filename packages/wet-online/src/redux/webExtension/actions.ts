import { actionCreator } from "@react-nano/tsrux";

export const setWebExtensionActive = actionCreator("WEB_EXTENSION/SET_ACTIVE", (active: boolean) => ({ active }));
