/**
 * Background Messaging Module
 *
 * @remarks
 * Initializes message routing for DevTools panel ↔ content script communication.
 * This module is imported by background/index.ts on service worker startup.
 */

import { defineChannel } from "@/messaging/core";
import {
  GET_DATABASES,
  GET_TABLE_LIST,
  GET_TABLE_SCHEMA,
  QUERY_TABLE_DATA,
  EXEC_SQL,
  SUBSCRIBE_LOGS,
  UNSUBSCRIBE_LOGS,
  GET_OPFS_FILES,
  DOWNLOAD_OPFS_FILE,
  HEARTBEAT,
} from "@/messaging/channels";

/**
 * Wire message format (matching src/messaging/core.ts)
 */
interface WireMessage {
  type: "request" | "response" | "register" | "unregister";
  channel: string;
  id?: string;
  payload?: unknown;
  success?: boolean;
  error?: string;
}

/**
 * 1. Import panel router function
 * 2. Used for forwarding messages to content script
 * 3. Dynamically imported to avoid circular dependencies
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { forwardToContentScript } = require("./panelRouter");

/**
 * 1. Create passthrough handler for a channel
 * 2. Forwards all requests to content script
 * 3. Returns response from content script
 *
 * @param channelName - Name of the channel to register
 * @returns Unsubscribe function
 */
const createPassthroughHandler = (channelName: string) => {
  /**
   * 1. Import panel router dynamically
   * 2. Forward message to content script
   * 3. Return response or error
   */
  const handler = async (payload: unknown): Promise<WireMessage> => {
    /**
     * 1. Get the forwardToContentScript function
     * 2. Build wire message from payload and channel name
     * 3. Forward to content script and return response
     */
    const { forwardToContentScript } = require("./panelRouter");

    /**
     * 1. Create wire message with request type
     * 2. Generate unique ID for this request
     * 3. Include payload from DevTools panel
     */
    const message: WireMessage = {
      type: "request",
      channel: channelName,
      id: `${channelName}--${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      payload,
    };

    return forwardToContentScript(message);
  };

  /**
   * 1. Register passthrough handler for the channel
   * 2. Return unsubscribe function for cleanup
   */
  const channel = defineChannel<unknown, WireMessage>(channelName);
  return channel.on(handler);
};

/**
 * 1. Register all passthrough channels for background routing
 * 2. Each channel forwards messages to content script
 * 3. Called once on background service worker startup
 *
 * @remarks
 * This function enables the Content Script Proxy Pattern (ADR-0001).
 * All messages from DevTools panel flow through these channels to content script.
 */
export const initializeBackgroundRouter = (): Array<() => void> => {
  const unsubscribers: Array<() => void> = [];

  /**
   * 1. Register all 10 passthrough channels
   * 2. Each channel forwards to content script handler
   * 3. Store unsubscribe functions for cleanup
   */
  unsubscribers.push(createPassthroughHandler(GET_DATABASES));
  unsubscribers.push(createPassthroughHandler(GET_TABLE_LIST));
  unsubscribers.push(createPassthroughHandler(GET_TABLE_SCHEMA));
  unsubscribers.push(createPassthroughHandler(QUERY_TABLE_DATA));
  unsubscribers.push(createPassthroughHandler(EXEC_SQL));
  unsubscribers.push(createPassthroughHandler(SUBSCRIBE_LOGS));
  unsubscribers.push(createPassthroughHandler(UNSUBSCRIBE_LOGS));
  unsubscribers.push(createPassthroughHandler(GET_OPFS_FILES));
  unsubscribers.push(createPassthroughHandler(DOWNLOAD_OPFS_FILE));
  unsubscribers.push(createPassthroughHandler(HEARTBEAT));

  console.log(
    "[Background Messaging] All passthrough channels registered (10 channels)",
  );

  return unsubscribers;
};
