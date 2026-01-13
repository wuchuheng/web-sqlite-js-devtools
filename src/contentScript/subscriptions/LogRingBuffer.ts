/**
 * Log Ring Buffer
 *
 * @remarks
 * Circular buffer for efficient log streaming with fixed memory footprint.
 * Implements 500 entry limit with batch sending (every 100ms or 50 entries).
 * Per ADR-0005: Ring Buffer for Log Streaming.
 */

/**
 * Log entry in ring buffer
 */
export type BufferedLogEntry = {
  level: "info" | "debug" | "error";
  data: unknown;
  timestamp: number;
};

/**
 * Ring buffer configuration
 */
export type RingBufferConfig = {
  maxSize: number; // 500 entries per ADR-0005
  batchSize: number; // 50 entries per ADR-0005
  batchInterval: number; // 100ms per ADR-0005
};

/**
 * Ring buffer state (encapsulated module state)
 */
export type RingBufferState = {
  buffer: BufferedLogEntry[];
  head: number; // Write position (0 to maxSize-1)
  count: number; // Current entry count (0 to maxSize)
  timer: ReturnType<typeof setInterval> | null; // Batch timer
};

/**
 * Default ring buffer configuration per ADR-0005
 */
const DEFAULT_CONFIG: RingBufferConfig = {
  maxSize: 500,
  batchSize: 50,
  batchInterval: 100,
} as const;

/**
 * Create a new ring buffer with circular overwrite behavior.
 *
 * @param config - Buffer configuration (uses defaults if not provided)
 * @param onBatch - Callback when batch is ready to send
 * @returns Ring buffer state object
 *
 * @remarks
 * - Allocates fixed-size array for O(1) access
 * - Starts batch timer for periodic sending
 * - Callback receives batch entries and clears buffer positions
 */
export const createRingBuffer = (
  config: Partial<RingBufferConfig> = {},
  onBatch?: (entries: BufferedLogEntry[]) => void,
): RingBufferState => {
  // Phase 1: Merge config with defaults
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Phase 2: Initialize buffer state
  const state: RingBufferState = {
    buffer: new Array(finalConfig.maxSize).fill(null) as BufferedLogEntry[],
    head: 0,
    count: 0,
    timer: null,
  };

  // Phase 3: Start batch timer if callback provided
  if (onBatch) {
    state.timer = setInterval(() => {
      const batch = ringBufferGetBatch(state);
      if (batch.length > 0) {
        onBatch(batch);
      }
    }, finalConfig.batchInterval);
  }

  return state;
};

/**
 * Add entry to ring buffer with circular overwrite.
 *
 * @param state - Ring buffer state object
 * @param entry - Log entry to add
 * @returns Boolean indicating if batch should be sent (when count reaches batchSize)
 *
 * @remarks
 * - Overwrites oldest entry when buffer is full (circular behavior)
 * - Updates head position using modulo arithmetic
 * - O(1) time complexity
 */
export const ringBufferAdd = (
  state: RingBufferState,
  entry: BufferedLogEntry,
): boolean => {
  // Phase 1: Write entry at head position
  state.buffer[state.head] = entry;

  // Phase 2: Update head and count
  state.head = (state.head + 1) % state.buffer.length;
  if (state.count < state.buffer.length) {
    state.count++;
  }

  // Phase 3: Check if batch should be sent
  return state.count >= DEFAULT_CONFIG.batchSize;
};

/**
 * Get current batch of entries from ring buffer.
 *
 * @param state - Ring buffer state object
 * @param maxEntries - Maximum entries to return (defaults to batchSize)
 * @returns Array of log entries (oldest first, limited by count)
 *
 * @remarks
 * - Returns entries in insertion order (oldest to newest)
 * - Does NOT clear buffer (caller should process entries)
 * - For batch sending with clear, use ringBufferClearBatch instead
 */
export const ringBufferGetBatch = (
  state: RingBufferState,
  maxEntries?: number,
): BufferedLogEntry[] => {
  // Phase 1: Determine batch size
  const limit = maxEntries ?? DEFAULT_CONFIG.batchSize;
  const size = Math.min(state.count, limit);

  // Phase 2: Extract entries in order
  const result: BufferedLogEntry[] = [];

  for (let i = 0; i < size; i++) {
    // Calculate position wrapping around buffer
    const pos =
      (state.head - state.count + i + state.buffer.length)
      % state.buffer.length;
    const entry = state.buffer[pos];
    if (entry) {
      result.push(entry);
    }
  }

  // Phase 3: Return batch
  return result;
};

/**
 * Clear batch entries from ring buffer after sending.
 *
 * @param state - Ring buffer state object
 * @param entryCount - Number of entries to clear (defaults to batchSize)
 * @returns Number of entries actually cleared
 *
 * @remarks
 * - Reduces count without moving head (buffer slots are reused)
 * - Should be called after batch is successfully sent
 * - Maintains circular buffer invariant
 */
export const ringBufferClearBatch = (
  state: RingBufferState,
  entryCount?: number,
): number => {
  // Phase 1: Determine clear count
  const limit = entryCount ?? DEFAULT_CONFIG.batchSize;
  const toClear = Math.min(state.count, limit);

  // Phase 2: Reduce count (buffer slots are overwritten on next add)
  state.count = Math.max(0, state.count - toClear);

  // Phase 3: Return cleared count
  return toClear;
};

/**
 * Destroy ring buffer and cleanup resources.
 *
 * @param state - Ring buffer state object
 *
 * @remarks
 * - Clears all entries from buffer
 * - Stops batch timer if running
 * - Resets state to initial values
 */
export const ringBufferDestroy = (state: RingBufferState): void => {
  // Phase 1: Clear buffer entries
  state.buffer.fill(null as unknown as BufferedLogEntry);

  // Phase 2: Stop batch timer
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }

  // Phase 3: Reset state
  state.head = 0;
  state.count = 0;
};

/**
 * LogRingBuffer module API (frozen for immutability)
 */
export const LogRingBuffer = Object.freeze({
  createRingBuffer,
  ringBufferAdd,
  ringBufferGetBatch,
  ringBufferClearBatch,
  ringBufferDestroy,
});
