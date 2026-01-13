/**
 * DevTools Inspected Window API
 *
 * @remarks
 * Public API layer for DevTools panel interaction with inspected page.
 * Re-exports from bridge and services layers for backward compatibility.
 *
 * @module
 */

// ============================================================================
// BRIDGE LAYER RE-EXPORTS
// ============================================================================

export {
  inspectedWindowBridge,
  type ExecuteOptions,
} from "./bridge/inspectedWindow";

// ============================================================================
// SERVICE LAYER RE-EXPORTS (backward compatible aliases)
// ============================================================================

import {
  databaseService,
  type ServiceResponse,
  type DatabaseSummary,
} from "./services/databaseService";

/**
 * @deprecated Use {@link ServiceResponse} instead
 */
export type InspectedWindowResponse<T> = ServiceResponse<T>;

/**
 * @deprecated Use {@link databaseService.getDatabases} instead
 */
export const getDatabasesFromInspectedWindow = databaseService.getDatabases;

/**
 * @deprecated Use {@link databaseService.getTableList} instead
 */
export const getTableListFromInspectedWindow = databaseService.getTableList;

// Type re-exports for backward compatibility
export type { ServiceResponse, DatabaseSummary };

// ============================================================================
// DIRECT EXPORTS
// ============================================================================

export { databaseService };
