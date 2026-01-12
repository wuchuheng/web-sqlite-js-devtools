/**
 * useConnection Hook
 *
 * @remarks
 * Manages heartbeat and auto-reconnect logic for DevTools panel.
 * Uses chrome.devtools.inspectedWindow.eval to check content script status.
 * Implements heartbeat-based detection with exponential backoff (ADR-0006).
 */

import { useState, useEffect, useRef } from "react";

/**
 * Exception info type from chrome.devtools.inspectedWindow.eval
 */
interface EvaluationExceptionInfo {
  isException: boolean;
  value?: unknown;
}

/**
 * Result type from chrome.devtools.inspectedWindow.eval
 */
interface InspectWindowResult {
  webSqliteDetected: boolean;
  success: boolean;
}

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
   * 1. Execute code in inspected page to check web-sqlite-js availability
   * 2. Verify window.__web_sqlite is present
   * 3. Set status to connected on success
   *
   * @remarks
   * Uses chrome.devtools.inspectedWindow.eval to execute code in the
   * inspected page context. This is the proper way for DevTools panels
   * to communicate with the inspected page.
   */
  const sendHeartbeat = () => {
    if (!isMounted.current) return;

    /**
     * 1. Check if web-sqlite-js API is available
     * 2. Return true when API exists
     * 3. Surface eval success flag
     */
    const checkScript = `(
      () => {
        const hasWebSqlite = typeof window.__web_sqlite !== 'undefined';
        return {
          webSqliteDetected: hasWebSqlite,
          success: true
        };
      }
    )()`;

    /**
     * 1. Execute script in inspected page
     * 2. Use chrome.devtools.inspectedWindow.eval (DevTools panel API)
     * 3. Handle response and errors appropriately
     */
    chrome.devtools.inspectedWindow.eval(
      checkScript,
      (result: InspectWindowResult, exceptionInfo: EvaluationExceptionInfo) => {
        if (!isMounted.current) return;

        if (exceptionInfo?.isException || !result || !result.success) {
          handleConnectionLost();
          return;
        }

        if (result.webSqliteDetected) {
          setStatus("connected");
          setError(undefined);
          retryCount.current = 0;
          scheduleNextHeartbeat();
        } else {
          handleConnectionLost();
        }
      },
    );
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
