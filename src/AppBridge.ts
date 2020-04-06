import React, { useContext } from "react";
import { WetAppBridge } from "web-ext-translator-shared";

const electronBridge: WetAppBridge | null = (window as any).electronBridge || null;

const AppBridgeContext = React.createContext(electronBridge);

export const useAppBridge = () => useContext(AppBridgeContext);
