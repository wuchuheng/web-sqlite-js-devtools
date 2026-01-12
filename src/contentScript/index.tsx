import App from "./App";
import styles from "./style.css?inline";
import { mountAnchoredUI } from "../utils/anchor-mounter";
import React from "react";

/**
 * Content script entry point
 * Called by @crxjs/vite-plugin loader when content script is injected
 */
export const onExecute = () => {
  void mountAnchoredUI({
    anchor: async () => [document.body],
    mountType: { type: "overlay" },
    component: () => React.createElement(App),
    style: styles,
    hostId: "extension-content-root",
  });
};
