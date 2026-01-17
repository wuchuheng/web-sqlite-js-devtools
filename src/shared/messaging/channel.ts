/**
 * Cross-World Messaging Channel
 *
 * @remarks
 * Provides a clean abstraction for MAIN world → ISOLATED world communication.
 * MAIN world can access page JavaScript (window.__web_sqlite).
 * ISOLATED world can access chrome.* APIs.
 *
 * Pattern:
 * - MAIN world: channel.send(messageType, data)
 * - ISOLATED world: channel.listen(messageType, handler)
 */

/**
 * Message types for cross-world communication
 */
export type MessageType = string;

/**
 * Message handler function type
 */
export type MessageHandler<T = unknown> = (data: T) => void;

/**
 * Internal message structure
 */
interface InternalMessage {
  type: MessageType;
  data: unknown;
}

/**
 * Channel for MAIN world → ISOLATED world communication
 */
export class CrossWorldChannel {
  private readonly handlers = new Map<MessageType, Set<MessageHandler>>();

  /**
   * Send a message from MAIN world to ISOLATED world
   *
   * @param type - Message type identifier
   * @param data - Message payload
   */
  send<T = unknown>(type: MessageType, data: T): void {
    const message: InternalMessage = { type, data };
    window.postMessage(message, "*");
  }

  /**
   * Listen for messages from MAIN world (ISOLATED world only)
   *
   * @param type - Message type to listen for
   * @param handler - Function to call when message is received
   * @returns Unsubscribe function
   */
  listen<T = unknown>(
    type: MessageType,
    handler: MessageHandler<T>,
  ): () => void {
    const typedHandler = handler as MessageHandler<unknown>;
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(typedHandler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(typedHandler);
      }
    };
  }

  /**
   * Start the message listener (call once in ISOLATED world)
   */
  start(): void {
    window.addEventListener("message", this.handleMessage);
  }

  /**
   * Stop the message listener
   */
  stop(): void {
    window.removeEventListener("message", this.handleMessage);
  }

  /**
   * Internal message handler
   */
  private handleMessage = (event: MessageEvent): void => {
    // Only accept messages from same window
    if (event.source !== window) {
      return;
    }

    const message = event.data as InternalMessage | undefined;
    if (!message?.type) {
      return;
    }

    // Forward to registered handlers
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.data));
    }
  };
}

/**
 * Singleton channel instance for MAIN → ISOLATED communication
 */
export const crossWorldChannel = new CrossWorldChannel();
