/**
 * useConnection Hook
 *
 * @remarks
 * Manages heartbeat and auto-reconnect logic for DevTools panel.
 * Implements heartbeat-based detection with exponential backoff (ADR-0006).
 */

import { useState, useEffect, useRef } from "react";
import { HEARTBEAT } from "@/messaging/channels";
import { defineChannel } from "@/messaging/core";

/**
 * Connection state type
 */
type ConnectionState =
  | "connected"
  | "connecting"
  | "reconnecting"
  | "disconnected";

/**
 * Connection hook return type
 */
interface UseConnectionReturn {
  status: ConnectionState;
  error?: string;
  retry: () => void;
}

/**
 * Heartbeat configuration constants
 */
const HEARTBEAT_INTERVAL = 5000; // 5 seconds
const TIMEOUT_THRESHOLD = 15000; // 15 seconds (3 missed heartbeats)
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 15000]; // Exponential backoff

/**
 * 1. Manage heartbeat connection to content script
 * 2. Detect connection loss via timeout
 * 3. Auto-reconnect with exponential backoff
 * 4. Provide manual retry function
 *
 * @remarks
 * This hook implements the auto-reconnect strategy from ADR-0006.
 * Heartbeat every 5 seconds, timeout after 15 seconds,
 * retry with exponential backoff (1s, 2s, 4s, 8s, 15s).
 *
 * @returns Connection state, error message, and retry function
 */
export const useConnection = (): UseConnectionReturn => {
  const [status, setStatus] = useState<ConnectionState>("connecting");
  const [error, setError] = useState<string>();

  const heartbeatTimer = useRef<NodeJS.Timeout>();
  const timeoutTimer = useRef<NodeJS.Timeout>();
  const retryCount = useRef(0);
  const isMounted = useRef(true);

  /**
   * 1. Send HEARTBEAT message via chrome.runtime.sendMessage
   * 2. Reset timeout timer on response
   * 3. Set status to connected on success
   *
   * @remarks
   * Uses defineChannel to create HEARTBEAT channel.
   * Sends current timestamp and expects echo back.
   */
  const sendHeartbeat = async () => {
    if (!isMounted.current) return;

    try {
      const channel = defineChannel<
        { timestamp: number },
        { success: boolean; data?: { timestamp: number } }
      >(HEARTBEAT);

      const response = await channel.send({ timestamp: Date.now() });

      if (response.success && isMounted.current) {
        setStatus("connected");
        setError(undefined);
        retryCount.current = 0;
        scheduleNextHeartbeat();
      }
    } catch (err) {
      if (isMounted.current) {
        handleConnectionLost();
      }
    }
  };

  /**
   * 1. Clear existing timers
   * 2. Schedule next heartbeat in 5s
   * 3. Handle connection timeout
   *
   * @remarks
   * Clears both heartbeat and timeout timers before scheduling.
   * If heartbeat doesn't receive response within 15s, triggers reconnection.
   */
  const scheduleNextHeartbeat = () => {
    if (!isMounted.current) return;

    clearTimeout(heartbeatTimer.current);
    clearTimeout(timeoutTimer.current);

    /**
     * 1. Schedule next heartbeat in 5 seconds
     * 2. Schedule timeout detection in 15 seconds
     * 3. If timeout occurs, connection is considered lost
     */
    heartbeatTimer.current = setTimeout(() => {
      if (isMounted.current) {
        sendHeartbeat();
      }
    }, HEARTBEAT_INTERVAL);

    timeoutTimer.current = setTimeout(() => {
      if (isMounted.current) {
        handleConnectionLost();
      }
    }, TIMEOUT_THRESHOLD);
  };

  /**
   * 1. Set status to reconnecting or disconnected
   * 2. Schedule retry with exponential backoff
   * 3. Show error after max retries
   *
   * @remarks
   * Implements exponential backoff: 1s, 2s, 4s, 8s, 15s
   * After 5 failed retries, shows error state with manual retry button.
   */
  const handleConnectionLost = () => {
    if (!isMounted.current) return;

    clearTimeout(heartbeatTimer.current);
    clearTimeout(timeoutTimer.current);

    if (retryCount.current < RETRY_DELAYS.length) {
      setStatus("reconnecting");
      const delay = RETRY_DELAYS[retryCount.current];
      retryCount.current++;

      /**
       * 1. Log retry attempt with delay
       * 2. Schedule retry after exponential backoff delay
       * 3. Reset retry count if connection succeeds
       */
      console.log(
        `[useConnection] Connection lost, retrying in ${delay}ms (attempt ${retryCount.current}/${RETRY_DELAYS.length})`,
      );

      setTimeout(() => {
        if (isMounted.current) {
          sendHeartbeat();
        }
      }, delay);
    } else {
      setStatus("disconnected");
      setError("Connection lost. Click Retry to reconnect.");
      console.log("[useConnection] Max retries reached, showing error");
    }
  };

  /**
   * 1. Manual retry function
   * 2. Reset retry count
   * 3. Immediately send heartbeat
   *
   * @remarks
   * Called when user clicks "Retry" button in error state.
   * Resets exponential backoff and immediately attempts connection.
   */
  const retry = () => {
    if (!isMounted.current) return;

    console.log("[useConnection] Manual retry triggered");
    retryCount.current = 0;
    setError(undefined);
    setStatus("connecting");
    sendHeartbeat();
  };

  /**
   * 1. Start heartbeat on mount
   * 2. Cleanup timers on unmount
   * 3. Prevent memory leaks
   */
  useEffect(() => {
    isMounted.current = true;
    sendHeartbeat();

    return () => {
      isMounted.current = false;
      clearTimeout(heartbeatTimer.current);
      clearTimeout(timeoutTimer.current);
      console.log("[useConnection] Connection hook unmounted");
    };
  }, []);

  return { status, error, retry };
};
