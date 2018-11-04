/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { State } from "../shared";
import { WetLanguage, WetMessageType, WetMessage } from "../wetInterfaces";
import { setDirty } from "../utils/setDirty";

export interface WetActionAddMessagePayload {
    asGroup: boolean;
    insertBefore: boolean;
    referenceMessageName: string;
    newMessageName: string;
}

export interface WetActionAddMessage {
    type: "ADD_MESSAGE";
    payload: WetActionAddMessagePayload;
}

function getBestCommentType(messages: WetMessage[]) {
    for (const message of messages) {
        if (message.type !== WetMessageType.MESSAGE)
            return message.type;
    }
    return WetMessageType.COMMENT;
}

function getBestGroupName(messages: WetMessage[]) {
    const groupNames = messages.filter((m) => m.type === WetMessageType.GROUP).map((m) => m.name);

    let groupIndex = 0;
    let groupName = "";
    do {
        groupName = `__WET_GROUP__${groupIndex++}`;
    } while (groupNames.indexOf(groupName) >= 0);
    return groupName;
}

export function handleAddMessage(state: State, payload: WetActionAddMessagePayload): State {
    if (!state.extension)
        return state;
    const extension = { ...state.extension };
    const mainLanguage = JSON.parse(JSON.stringify(extension.mainLanguage)) as WetLanguage;
    const index = mainLanguage.messages.findIndex((m) => m.name === payload.referenceMessageName);
    if (index === -1)
        return state;

    const newMessage: WetMessage = {
        type: payload.asGroup ? getBestCommentType(mainLanguage.messages) : WetMessageType.MESSAGE,
        name: payload.asGroup ? getBestGroupName(mainLanguage.messages) : payload.newMessageName,
        message: payload.asGroup ? payload.newMessageName : ""
    };
    const insertIndex = payload.insertBefore ? index : index + 1;
    mainLanguage.messages.splice(insertIndex, 0, newMessage);
    mainLanguage.messagesByKey[payload.newMessageName] = newMessage;

    extension.languages = { ...extension.languages, [mainLanguage.locale]: mainLanguage };
    extension.mainLanguage = mainLanguage;
    setDirty(state.appBridge, true);
    return { ...state, extension };
}
